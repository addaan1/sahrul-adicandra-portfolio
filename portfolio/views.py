from django.shortcuts import render
from django.views.decorators.http import require_GET

from .data import (
    ACHIEVEMENTS,
    ADDITIONAL_PROJECTS,
    JOURNEY,
    PROFILE,
    PROJECTS,
    SKILL_GROUPS,
    STATS,
)


@require_GET
def home(request):
    return render(
        request,
        "portfolio/home.html",
        {
            "profile": PROFILE,
            "stats": STATS,
            "skill_groups": SKILL_GROUPS,
            "projects": PROJECTS,
            "additional_projects": ADDITIONAL_PROJECTS,
            "journey": JOURNEY,
            "achievements": ACHIEVEMENTS,
        },
    )
