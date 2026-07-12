from django.test import TestCase
from django.urls import reverse

from .models import ContactMessage


class PortfolioTests(TestCase):
    def test_home_page_renders_profile(self):
        response = self.client.get(reverse("portfolio:home"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Sahrul Adicandra Effendy")
        self.assertContains(response, "EcoDash Economic Intelligence")

    def test_contact_message_is_saved(self):
        response = self.client.post(
            reverse("portfolio:home"),
            {
                "name": "Recruiter",
                "email": "recruiter@example.com",
                "company": "Example Labs",
                "message": "Let's discuss a data product role.",
                "website": "",
            },
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(ContactMessage.objects.count(), 1)

    def test_honeypot_blocks_message(self):
        self.client.post(
            reverse("portfolio:home"),
            {
                "name": "Bot",
                "email": "bot@example.com",
                "company": "",
                "message": "Spam",
                "website": "https://spam.example.com",
            },
        )
        self.assertEqual(ContactMessage.objects.count(), 0)
