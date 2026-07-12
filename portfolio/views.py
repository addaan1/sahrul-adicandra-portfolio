from django.contrib import messages
from django.shortcuts import redirect, render
from django.urls import reverse

from .data import ACHIEVEMENTS, JOURNEY, PROFILE, PROJECTS, SKILL_GROUPS, STATS
from .forms import ContactForm


def home(request):
    form = ContactForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "Message received. Thank you for reaching out.")
        return redirect(f"{reverse('portfolio:home')}#contact")

    return render(
        request,
        "portfolio/home.html",
        {
            "profile": PROFILE,
            "stats": STATS,
            "skill_groups": SKILL_GROUPS,
            "projects": PROJECTS,
            "journey": JOURNEY,
            "achievements": ACHIEVEMENTS,
            "form": form,
        },
    )
