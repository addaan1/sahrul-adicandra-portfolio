(() => {
    "use strict";

    const canvas = document.getElementById("worldCanvas");
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.__PORTFOLIO_WORLD_READY__ = true;
        window.dispatchEvent(new CustomEvent("portfolio:world-ready"));
        return;
    }

    const gl = canvas.getContext("webgl", {
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        premultipliedAlpha: false,
    });

    if (!gl) {
        document.documentElement.classList.add("no-webgl");
        window.__PORTFOLIO_WORLD_READY__ = true;
        window.dispatchEvent(new CustomEvent("portfolio:world-ready"));
        return;
    }

    const dprCap = window.innerWidth < 720 ? 1.2 : 1.65;
    const mobile = window.innerWidth < 800;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let sceneIndex = 0;
    let targetScene = 0;
    let pointerX = 0;
    let pointerY = 0;
    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let lastTime = performance.now();
    let elapsed = 0;
    let paused = false;

    const vertexShaderSource = `
        attribute vec3 aPosition;
        attribute vec3 aNormal;
        uniform mat4 uModel;
        uniform mat4 uViewProjection;
        uniform mat3 uNormalMatrix;
        varying vec3 vNormal;
        varying vec3 vWorld;
        varying float vDepth;
        void main() {
            vec4 world = uModel * vec4(aPosition, 1.0);
            vWorld = world.xyz;
            vNormal = normalize(uNormalMatrix * aNormal);
            vec4 clip = uViewProjection * world;
            vDepth = clip.w;
            gl_Position = clip;
        }
    `;

    const fragmentShaderSource = `
        precision mediump float;
        varying vec3 vNormal;
        varying vec3 vWorld;
        varying float vDepth;
        uniform vec3 uColor;
        uniform vec3 uLightDir;
        uniform vec3 uFogColor;
        uniform float uAlpha;
        uniform float uGlow;
        uniform float uFogNear;
        uniform float uFogFar;
        void main() {
            float diffuse = max(dot(normalize(vNormal), normalize(uLightDir)), 0.0);
            float rim = pow(1.0 - max(dot(normalize(vNormal), normalize(-vWorld)), 0.0), 2.0);
            vec3 lit = uColor * (0.32 + diffuse * 0.72) + uColor * rim * uGlow;
            float fog = smoothstep(uFogNear, uFogFar, max(vDepth, 0.0));
            vec3 finalColor = mix(lit, uFogColor, fog);
            gl_FragColor = vec4(finalColor, uAlpha * (1.0 - fog * 0.35));
        }
    `;

    const pointVertexSource = `
        attribute vec3 aPosition;
        attribute float aSize;
        attribute float aPhase;
        uniform mat4 uViewProjection;
        uniform float uTime;
        varying float vAlpha;
        void main() {
            vec3 p = aPosition;
            p.y += sin(uTime * 0.34 + aPhase) * 0.38;
            vec4 clip = uViewProjection * vec4(p, 1.0);
            gl_Position = clip;
            gl_PointSize = aSize * (220.0 / max(clip.w, 1.0));
            vAlpha = 0.38 + 0.62 * (0.5 + 0.5 * sin(uTime * 1.2 + aPhase));
        }
    `;

    const pointFragmentSource = `
        precision mediump float;
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
            vec2 uv = gl_PointCoord - 0.5;
            float d = length(uv);
            if (d > 0.5) discard;
            float glow = smoothstep(0.5, 0.0, d);
            gl_FragColor = vec4(uColor, glow * vAlpha);
        }
    `;

    const compileShader = (type, source) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.warn("World shader error:", gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    };

    const createProgram = (vs, fs) => {
        const program = gl.createProgram();
        gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vs));
        gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fs));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.warn("World program error:", gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    };

    const meshProgram = createProgram(vertexShaderSource, fragmentShaderSource);
    const pointProgram = createProgram(pointVertexSource, pointFragmentSource);
    if (!meshProgram || !pointProgram) {
        window.__PORTFOLIO_WORLD_READY__ = true;
        window.dispatchEvent(new CustomEvent("portfolio:world-ready"));
        return;
    }

    const meshLoc = {
        position: gl.getAttribLocation(meshProgram, "aPosition"),
        normal: gl.getAttribLocation(meshProgram, "aNormal"),
        model: gl.getUniformLocation(meshProgram, "uModel"),
        viewProjection: gl.getUniformLocation(meshProgram, "uViewProjection"),
        normalMatrix: gl.getUniformLocation(meshProgram, "uNormalMatrix"),
        color: gl.getUniformLocation(meshProgram, "uColor"),
        lightDir: gl.getUniformLocation(meshProgram, "uLightDir"),
        fogColor: gl.getUniformLocation(meshProgram, "uFogColor"),
        alpha: gl.getUniformLocation(meshProgram, "uAlpha"),
        glow: gl.getUniformLocation(meshProgram, "uGlow"),
        fogNear: gl.getUniformLocation(meshProgram, "uFogNear"),
        fogFar: gl.getUniformLocation(meshProgram, "uFogFar"),
    };

    const pointLoc = {
        position: gl.getAttribLocation(pointProgram, "aPosition"),
        size: gl.getAttribLocation(pointProgram, "aSize"),
        phase: gl.getAttribLocation(pointProgram, "aPhase"),
        viewProjection: gl.getUniformLocation(pointProgram, "uViewProjection"),
        time: gl.getUniformLocation(pointProgram, "uTime"),
        color: gl.getUniformLocation(pointProgram, "uColor"),
    };

    const mat4 = {
        identity() {
            return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
        },
        multiply(a, b) {
            const out = new Float32Array(16);
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 4; col++) {
                    out[col * 4 + row] =
                        a[0 * 4 + row] * b[col * 4 + 0] +
                        a[1 * 4 + row] * b[col * 4 + 1] +
                        a[2 * 4 + row] * b[col * 4 + 2] +
                        a[3 * 4 + row] * b[col * 4 + 3];
                }
            }
            return out;
        },
        perspective(fov, aspect, near, far) {
            const f = 1 / Math.tan(fov / 2);
            const nf = 1 / (near - far);
            return new Float32Array([
                f / aspect,0,0,0,
                0,f,0,0,
                0,0,(far + near) * nf,-1,
                0,0,2 * far * near * nf,0,
            ]);
        },
        lookAt(eye, center, up) {
            const z = normalize(sub(eye, center));
            const x = normalize(cross(up, z));
            const y = cross(z, x);
            return new Float32Array([
                x[0],y[0],z[0],0,
                x[1],y[1],z[1],0,
                x[2],y[2],z[2],0,
                -dot(x, eye),-dot(y, eye),-dot(z, eye),1,
            ]);
        },
        compose(position, rotation, scale) {
            const [sx, sy, sz] = scale;
            const [rx, ry, rz] = rotation;
            const cx = Math.cos(rx), sxr = Math.sin(rx);
            const cy = Math.cos(ry), syr = Math.sin(ry);
            const cz = Math.cos(rz), szr = Math.sin(rz);
            const m00 = cy * cz;
            const m01 = sxr * syr * cz - cx * szr;
            const m02 = cx * syr * cz + sxr * szr;
            const m10 = cy * szr;
            const m11 = sxr * syr * szr + cx * cz;
            const m12 = cx * syr * szr - sxr * cz;
            const m20 = -syr;
            const m21 = sxr * cy;
            const m22 = cx * cy;
            return new Float32Array([
                m00*sx,m01*sx,m02*sx,0,
                m10*sy,m11*sy,m12*sy,0,
                m20*sz,m21*sz,m22*sz,0,
                position[0],position[1],position[2],1,
            ]);
        },
    };

    const sub = (a,b) => [a[0]-b[0],a[1]-b[1],a[2]-b[2]];
    const dot = (a,b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
    const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    const normalize = (v) => {
        const l = Math.hypot(v[0],v[1],v[2]) || 1;
        return [v[0]/l,v[1]/l,v[2]/l];
    };
    const lerp = (a,b,t) => a+(b-a)*t;
    const lerpVec = (a,b,t) => [lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
    const hex = (value) => {
        const n = parseInt(value.replace("#", ""), 16);
        return [((n>>16)&255)/255,((n>>8)&255)/255,(n&255)/255];
    };

    const normalMatrixFromModel = (m) => new Float32Array([
        m[0],m[1],m[2],
        m[4],m[5],m[6],
        m[8],m[9],m[10],
    ]);

    const createGeometry = (positions, normals, indices) => {
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        return { positionBuffer, normalBuffer, indexBuffer, count: indices.length };
    };

    const createBox = () => {
        const p = [
            -1,-1,1, 1,-1,1, 1,1,1, -1,1,1,
            1,-1,-1, -1,-1,-1, -1,1,-1, 1,1,-1,
            -1,1,1, 1,1,1, 1,1,-1, -1,1,-1,
            -1,-1,-1, 1,-1,-1, 1,-1,1, -1,-1,1,
            1,-1,1, 1,-1,-1, 1,1,-1, 1,1,1,
            -1,-1,-1, -1,-1,1, -1,1,1, -1,1,-1,
        ];
        const n = [
            0,0,1,0,0,1,0,0,1,0,0,1,
            0,0,-1,0,0,-1,0,0,-1,0,0,-1,
            0,1,0,0,1,0,0,1,0,0,1,0,
            0,-1,0,0,-1,0,0,-1,0,0,-1,0,
            1,0,0,1,0,0,1,0,0,1,0,0,
            -1,0,0,-1,0,0,-1,0,0,-1,0,0,
        ];
        const i = [];
        for (let f=0;f<6;f++) { const o=f*4; i.push(o,o+1,o+2,o,o+2,o+3); }
        return createGeometry(p,n,i);
    };

    const createCylinder = (segments=20, capped=true) => {
        const p=[],n=[],i=[];
        for(let s=0;s<=segments;s++){
            const a=s/segments*Math.PI*2, x=Math.cos(a), z=Math.sin(a);
            p.push(x,-1,z,x,1,z); n.push(x,0,z,x,0,z);
        }
        for(let s=0;s<segments;s++){ const o=s*2;i.push(o,o+1,o+3,o,o+3,o+2); }
        if(capped){
            const topCenter=p.length/3;p.push(0,1,0);n.push(0,1,0);
            const bottomCenter=p.length/3;p.push(0,-1,0);n.push(0,-1,0);
            const topStart=p.length/3;
            for(let s=0;s<=segments;s++){const a=s/segments*Math.PI*2;p.push(Math.cos(a),1,Math.sin(a));n.push(0,1,0);}
            const bottomStart=p.length/3;
            for(let s=0;s<=segments;s++){const a=s/segments*Math.PI*2;p.push(Math.cos(a),-1,Math.sin(a));n.push(0,-1,0);}
            for(let s=0;s<segments;s++){i.push(topCenter,topStart+s,topStart+s+1);i.push(bottomCenter,bottomStart+s+1,bottomStart+s);}
        }
        return createGeometry(p,n,i);
    };

    const createCone = (segments=18) => {
        const p=[],n=[],i=[];
        for(let s=0;s<=segments;s++){
            const a=s/segments*Math.PI*2,x=Math.cos(a),z=Math.sin(a);
            p.push(x,1,z, 0,-1,0);
            const normal=normalize([x,1.2,z]);n.push(...normal,...normal);
        }
        for(let s=0;s<segments;s++){const o=s*2;i.push(o,o+1,o+2,o+2,o+1,o+3);}
        const c=p.length/3;p.push(0,1,0);n.push(0,1,0);
        const start=p.length/3;
        for(let s=0;s<=segments;s++){const a=s/segments*Math.PI*2;p.push(Math.cos(a),1,Math.sin(a));n.push(0,1,0);}
        for(let s=0;s<segments;s++)i.push(c,start+s,start+s+1);
        return createGeometry(p,n,i);
    };

    const createSphere = (lat=10, lon=14) => {
        const p=[],n=[],i=[];
        for(let y=0;y<=lat;y++){
            const v=y/lat,phi=v*Math.PI;
            for(let x=0;x<=lon;x++){
                const u=x/lon,theta=u*Math.PI*2;
                const sx=Math.sin(phi)*Math.cos(theta), sy=Math.cos(phi), sz=Math.sin(phi)*Math.sin(theta);
                p.push(sx,sy,sz);n.push(sx,sy,sz);
            }
        }
        for(let y=0;y<lat;y++)for(let x=0;x<lon;x++){
            const a=y*(lon+1)+x,b=a+lon+1;
            i.push(a,b,a+1,b,b+1,a+1);
        }
        return createGeometry(p,n,i);
    };

    const createTorus = (majorSegments=48, minorSegments=8, radius=.13) => {
        const p=[],n=[],i=[];
        for(let j=0;j<=majorSegments;j++){
            const u=j/majorSegments*Math.PI*2,cu=Math.cos(u),su=Math.sin(u);
            for(let k=0;k<=minorSegments;k++){
                const v=k/minorSegments*Math.PI*2,cv=Math.cos(v),sv=Math.sin(v);
                p.push((1+radius*cv)*cu,radius*sv,(1+radius*cv)*su);
                n.push(cv*cu,sv,cv*su);
            }
        }
        const row=minorSegments+1;
        for(let j=0;j<majorSegments;j++)for(let k=0;k<minorSegments;k++){
            const a=j*row+k,b=(j+1)*row+k;
            i.push(a,b,a+1,b,b+1,a+1);
        }
        return createGeometry(p,n,i);
    };

    const createOctahedron = () => {
        const verts=[[0,1,0],[1,0,0],[0,0,1],[-1,0,0],[0,0,-1],[0,-1,0]];
        const faces=[[0,1,2],[0,2,3],[0,3,4],[0,4,1],[5,2,1],[5,3,2],[5,4,3],[5,1,4]];
        const p=[],n=[],i=[];
        faces.forEach(face=>{
            const a=verts[face[0]],b=verts[face[1]],c=verts[face[2]],normal=normalize(cross(sub(b,a),sub(c,a))),o=p.length/3;
            p.push(...a,...b,...c);n.push(...normal,...normal,...normal);i.push(o,o+1,o+2);
        });
        return createGeometry(p,n,i);
    };

    const geometries = {
        box: createBox(),
        cylinder: createCylinder(mobile?12:20),
        cone: createCone(mobile?12:18),
        sphere: createSphere(mobile?7:10,mobile?10:14),
        torus: createTorus(mobile?34:56,mobile?6:9,.09),
        torusThin: createTorus(mobile?34:60,6,.035),
        crystal: createOctahedron(),
    };

    const mesh = (geometry, position, scale, rotation, color, options={}) => ({
        geometry, position:[...position], scale:[...scale], rotation:[...rotation], color, alpha:options.alpha ?? 1,
        glow:options.glow ?? .08, transparent:options.transparent ?? false, spin:options.spin || [0,0,0], bob:options.bob || 0,
        phase:options.phase || Math.random()*Math.PI*2,
    });

    const staticObjects=[];
    const transparentObjects=[];
    const trackObjects=[];
    const islandObjects=[];
    const crystalObjects=[];

    // Floating rail system
    trackObjects.push(mesh(geometries.torus,[4.8,1.1,-3.8],[8.7,.6,8.7],[0,0,0],"#6c6047",{glow:.12}));
    trackObjects.push(mesh(geometries.torusThin,[4.8,1.5,-3.8],[8.95,.7,8.95],[0,0,0],"#f3c66f",{glow:.72}));
    trackObjects.push(mesh(geometries.torusThin,[4.8,.72,-3.8],[8.45,.7,8.45],[0,0,0],"#4fbfc8",{glow:.28}));
    staticObjects.push(...trackObjects);

    // Rail sleepers / energy pylons
    for(let k=0;k<(mobile?18:30);k++){
        const a=k/(mobile?18:30)*Math.PI*2,r=8.7,x=4.8+Math.cos(a)*r,z=-3.8+Math.sin(a)*r;
        staticObjects.push(mesh(geometries.box,[x,1.05,z],[.12,.08,.55],[0,-a,0],k%3===0?"#e7ba63":"#294957",{glow:k%3===0?.42:.05}));
    }

    // Floating islands
    const islands = [
        [-4.8,-1.5,-7.2,3.2,4.2,"#355d55"],[7.9,-2.4,-9.8,4.3,5.6,"#3f5968"],[12.2,-.8,2.5,2.6,3.8,"#4b596e"],
        [-9.5,-3.3,1.0,3.7,5.2,"#384f62"],[1.4,-4.1,7.5,5.2,6.5,"#2f5560"],[16,-3.2,-4,3.7,5.3,"#40516b"],
        [-14,-2.5,-12,4.6,6.2,"#34545c"],[4,-5.5,-18,6.5,8.2,"#374b5f"],
    ];
    islands.forEach((v,idx)=>{
        const [x,y,z,r,h,c]=v;
        const body=mesh(geometries.cone,[x,y,z],[r,h,r],[Math.PI,idx*.23,0],c,{glow:.05,bob:.06,phase:idx});
        const top=mesh(geometries.cylinder,[x,y+h*.87,z],[r*.98,.18,r*.98],[0,idx*.2,0],idx%2?"#5a786d":"#52756b",{glow:.08,bob:.06,phase:idx});
        islandObjects.push(body,top); staticObjects.push(body,top);
        if(idx<6){
            for(let t=0;t<3;t++){
                const angle=t/3*Math.PI*2+idx, cr=.9+t*.34;
                const crystal=mesh(geometries.crystal,[x+Math.cos(angle)*r*.45,y+h*.98+cr*.22,z+Math.sin(angle)*r*.45],[.25,cr,.25],[0,angle,0],idx%2?"#f4c76e":"#72e8df",{glow:.82,bob:.18,phase:idx+t});
                crystalObjects.push(crystal);staticObjects.push(crystal);
            }
        }
    });

    // Arches and ruins to make the world feel authored
    const archColor="#607e91";
    [[-4,4,-11],[11,4,-5],[-9,3,3]].forEach((p,idx)=>{
        staticObjects.push(mesh(geometries.cylinder,[p[0]-1.3,p[1],p[2]],[.22,2.2,.22],[0,0,0],archColor,{glow:.08}));
        staticObjects.push(mesh(geometries.cylinder,[p[0]+1.3,p[1],p[2]],[.22,2.2,.22],[0,0,0],archColor,{glow:.08}));
        staticObjects.push(mesh(geometries.torus,[p[0],p[1]+2,p[2]],[1.3,1.3,.45],[Math.PI/2,0,0],idx===1?"#7eeadd":"#6e86a8",{glow:.28}));
    });

    // Cloud banks: low-poly translucent spheres
    const cloudCount = mobile ? 30 : 54;
    for(let i=0;i<cloudCount;i++){
        const angle=Math.random()*Math.PI*2, radius=9+Math.random()*19;
        const x=3+Math.cos(angle)*radius, z=-5+Math.sin(angle)*radius, y=-1+Math.random()*10;
        transparentObjects.push(mesh(geometries.sphere,[x,y,z],[2.2+Math.random()*3.6,.6+Math.random()*1.1,1.6+Math.random()*2.8],[0,Math.random()*3,0],i%3===0?"#a6d8dd":"#c8e4e7",{alpha:.08+Math.random()*.08,transparent:true,bob:.12,phase:i}));
    }

    // Distant moon / celestial body
    transparentObjects.push(mesh(geometries.sphere,[18,16,-29],[5.8,5.8,5.8],[0,0,0],"#ffe0a0",{alpha:.24,transparent:true,glow:.9}));
    transparentObjects.push(mesh(geometries.sphere,[-24,12,-38],[8,8,8],[0,0,0],"#557eb9",{alpha:.07,transparent:true,glow:.45}));

    // Particle field
    const particleCount = mobile ? 180 : 420;
    const particleData = new Float32Array(particleCount*5);
    for(let i=0;i<particleCount;i++){
        const angle=Math.random()*Math.PI*2,r=6+Math.random()*39;
        particleData[i*5]=3+Math.cos(angle)*r;
        particleData[i*5+1]=-4+Math.random()*28;
        particleData[i*5+2]=-8+Math.sin(angle)*r;
        particleData[i*5+3]=.8+Math.random()*2.3;
        particleData[i*5+4]=Math.random()*Math.PI*2;
    }
    const particleBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,particleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,particleData,gl.STATIC_DRAW);

    const palettes = [
        {fog:"#0a2235",accent:"#7cf1e7",light:[-.38,.90,.22]},
        {fog:"#142b43",accent:"#f0c66f",light:[-.46,.86,.28]},
        {fog:"#263149",accent:"#ffd98b",light:[-.32,.92,.18]},
        {fog:"#172b43",accent:"#79e8df",light:[-.52,.82,.32]},
        {fog:"#173847",accent:"#efbd62",light:[-.36,.88,.24]},
        {fog:"#1b2d4d",accent:"#8ab8ff",light:[-.48,.80,.38]},
        {fog:"#324052",accent:"#ffe2a2",light:[-.30,.94,.16]},
    ];

    const cameraScenes = [
        {eye:[-7.0,9.4,20.5],target:[5.0,1.2,-4.2],fov:47},
        {eye:[15.5,9.0,18.5],target:[4.2,1.0,-4.5],fov:46},
        {eye:[-11.5,8.5,14.0],target:[4.0,1.0,-4.5],fov:47},
        {eye:[5.0,15.0,23.5],target:[5.0,1.0,-4.0],fov:50},
        {eye:[18.0,8.0,11.0],target:[4.0,.8,-4.0],fov:47},
        {eye:[-10.0,14.0,6.0],target:[4.5,1.8,-7.0],fov:45},
        {eye:[6.0,9.5,24.5],target:[5.0,1.1,-4.0],fov:48},
    ];

    let camera = {...cameraScenes[0],eye:[...cameraScenes[0].eye],target:[...cameraScenes[0].target]};
    let fogColor = hex(palettes[0].fog);
    let accentColor = hex(palettes[0].accent);
    let lightDir = [...palettes[0].light];

    const trainParts = [];
    const trainColor="#eef7f3";
    const trainAccent="#f1c66e";
    for(let c=0;c<3;c++){
        trainParts.push({offset:c*1.35,body:mesh(geometries.box,[0,0,0],[.82,.52,1.1],[0,0,0],trainColor,{glow:.12})});
        trainParts.push({offset:c*1.35,body:mesh(geometries.box,[0,0,0],[.66,.34,1.13],[0,0,0],c===0?trainAccent:"#397b83",{glow:c===0?.65:.1}) ,upper:true});
    }

    const bindGeometry = (geometry) => {
        gl.bindBuffer(gl.ARRAY_BUFFER,geometry.positionBuffer);
        gl.enableVertexAttribArray(meshLoc.position);
        gl.vertexAttribPointer(meshLoc.position,3,gl.FLOAT,false,0,0);
        gl.bindBuffer(gl.ARRAY_BUFFER,geometry.normalBuffer);
        gl.enableVertexAttribArray(meshLoc.normal);
        gl.vertexAttribPointer(meshLoc.normal,3,gl.FLOAT,false,0,0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,geometry.indexBuffer);
    };

    const drawMesh = (object, viewProjection, time) => {
        object.rotation[0]+=object.spin[0]*.002;
        object.rotation[1]+=object.spin[1]*.002;
        object.rotation[2]+=object.spin[2]*.002;
        const pos=[object.position[0],object.position[1]+Math.sin(time*.55+object.phase)*object.bob,object.position[2]];
        const model=mat4.compose(pos,object.rotation,object.scale);
        bindGeometry(object.geometry);
        gl.uniformMatrix4fv(meshLoc.model,false,model);
        gl.uniformMatrix3fv(meshLoc.normalMatrix,false,normalMatrixFromModel(model));
        gl.uniform3fv(meshLoc.color,hex(object.color));
        gl.uniform1f(meshLoc.alpha,object.alpha);
        gl.uniform1f(meshLoc.glow,object.glow);
        gl.drawElements(gl.TRIANGLES,object.geometry.count,gl.UNSIGNED_SHORT,0);
    };

    const drawTrain = (viewProjection,time) => {
        const radius=8.7;
        const baseAngle=time*.16+sceneIndex*.25;
        trainParts.forEach((part,idx)=>{
            const angle=baseAngle-part.offset/radius;
            const x=4.8+Math.cos(angle)*radius;
            const z=-3.8+Math.sin(angle)*radius;
            const y=part.upper?2.05:1.5;
            const obj=part.body;
            obj.position[0]=x;obj.position[1]=y;obj.position[2]=z;
            obj.rotation[1]=-angle+Math.PI/2;
            obj.scale[2]=idx<2?1.3:1.05;
            drawMesh(obj,viewProjection,time);
        });
    };

    const resize = () => {
        dpr=Math.min(window.devicePixelRatio||1,dprCap);
        width=Math.max(1,Math.floor(canvas.clientWidth*dpr));
        height=Math.max(1,Math.floor(canvas.clientHeight*dpr));
        if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);}
    };

    const render = (now) => {
        if(paused){requestAnimationFrame(render);return;}
        const dt=Math.min((now-lastTime)/1000,.05);lastTime=now;elapsed+=dt;
        resize();
        const motionBlend = 1 - Math.exp(-dt * 3.8);
        const cameraBlend = 1 - Math.exp(-dt * 3.2);
        pointerX=lerp(pointerX,pointerTargetX,motionBlend);pointerY=lerp(pointerY,pointerTargetY,motionBlend);
        sceneIndex=lerp(sceneIndex,targetScene,1 - Math.exp(-dt * 2.55));
        const low=Math.floor(sceneIndex),high=Math.min(6,Math.ceil(sceneIndex)),blend=sceneIndex-low;
        const a=cameraScenes[low],b=cameraScenes[high];
        const desiredEye=lerpVec(a.eye,b.eye,blend);
        const desiredTarget=lerpVec(a.target,b.target,blend);
        desiredEye[0]+=pointerX*1.25;desiredEye[1]+=-pointerY*.65;
        desiredTarget[0]+=pointerX*.4;desiredTarget[1]+=-pointerY*.28;
        camera.eye=lerpVec(camera.eye,desiredEye,cameraBlend);
        camera.target=lerpVec(camera.target,desiredTarget,cameraBlend);
        camera.fov=lerp(camera.fov,lerp(a.fov,b.fov,blend),1 - Math.exp(-dt * 3.0));
        const pa=palettes[low],pb=palettes[high];
        const colorBlend = 1 - Math.exp(-dt * 2.8);
        fogColor=lerpVec(fogColor,lerpVec(hex(pa.fog),hex(pb.fog),blend),colorBlend);
        accentColor=lerpVec(accentColor,lerpVec(hex(pa.accent),hex(pb.accent),blend),colorBlend);
        lightDir=lerpVec(lightDir,lerpVec(pa.light,pb.light,blend),colorBlend);

        gl.clearColor(0,0,0,0);
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        const projection=mat4.perspective(camera.fov*Math.PI/180,width/height,.1,120);
        const view=mat4.lookAt(camera.eye,camera.target,[0,1,0]);
        const viewProjection=mat4.multiply(projection,view);

        gl.useProgram(meshProgram);
        gl.uniformMatrix4fv(meshLoc.viewProjection,false,viewProjection);
        gl.uniform3fv(meshLoc.lightDir,lightDir);
        gl.uniform3fv(meshLoc.fogColor,fogColor);
        gl.uniform1f(meshLoc.fogNear,18);
        gl.uniform1f(meshLoc.fogFar,72);

        staticObjects.forEach(obj=>drawMesh(obj,viewProjection,elapsed));
        drawTrain(viewProjection,elapsed);

        gl.disable(gl.CULL_FACE);
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
        gl.depthMask(false);
        transparentObjects.forEach(obj=>drawMesh(obj,viewProjection,elapsed));

        gl.useProgram(pointProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER,particleBuffer);
        const stride=5*4;
        gl.enableVertexAttribArray(pointLoc.position);
        gl.vertexAttribPointer(pointLoc.position,3,gl.FLOAT,false,stride,0);
        gl.enableVertexAttribArray(pointLoc.size);
        gl.vertexAttribPointer(pointLoc.size,1,gl.FLOAT,false,stride,3*4);
        gl.enableVertexAttribArray(pointLoc.phase);
        gl.vertexAttribPointer(pointLoc.phase,1,gl.FLOAT,false,stride,4*4);
        gl.uniformMatrix4fv(pointLoc.viewProjection,false,viewProjection);
        gl.uniform1f(pointLoc.time,elapsed);
        gl.uniform3fv(pointLoc.color,accentColor);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
        gl.drawArrays(gl.POINTS,0,particleCount);
        gl.depthMask(true);
        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);

        requestAnimationFrame(render);
    };

    const setScene = (index) => {
        targetScene=Math.max(0,Math.min(6,Number(index)||0));
    };

    window.PortfolioWorld = { setScene, pause(value=true){paused=value;lastTime=performance.now();} };
    window.addEventListener("pointermove",(event)=>{
        pointerTargetX=(event.clientX/window.innerWidth-.5)*2;
        pointerTargetY=(event.clientY/window.innerHeight-.5)*2;
    },{passive:true});
    window.addEventListener("portfolio:scenechange",event=>setScene(event.detail.index));
    document.addEventListener("visibilitychange",()=>{paused=document.hidden;lastTime=performance.now();});
    window.addEventListener("resize",resize,{passive:true});

    // Fake staged progress while geometry is already generated, giving the UI a polished handoff.
    let loading=0;
    const loadingTimer=setInterval(()=>{
        loading+=8+Math.random()*14;
        window.dispatchEvent(new CustomEvent("portfolio:world-progress",{detail:{value:Math.min(loading,96)}}));
        if(loading>=96){
            clearInterval(loadingTimer);
            setTimeout(()=>{
                canvas.classList.add("is-ready");
                window.__PORTFOLIO_WORLD_READY__ = true;
                window.dispatchEvent(new CustomEvent("portfolio:world-progress",{detail:{value:100}}));
                window.dispatchEvent(new CustomEvent("portfolio:world-ready"));
            },180);
        }
    },70);

    resize();
    requestAnimationFrame(render);
})();
