from django.test import TestCase
from django.urls import reverse



class PortfolioTests(TestCase):
    def test_home_page_renders_professional_profile(self):
        response = self.client.get(reverse("portfolio:home"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Sahrul Adicandra Effendy")
        self.assertContains(response, "Selected Projects")
        self.assertContains(response, "March Machine Learning Mania 2026")
        self.assertContains(response, "Dataset Doctor")

    def test_contact_form_has_been_removed(self):
        response = self.client.get(reverse("portfolio:home"))
        self.assertNotContains(response, "Send transmission")
        self.assertNotContains(response, "<form", html=False)
        self.assertContains(response, "mailto:sahrul.adican.effendy-2023@ftmm.unair.ac.id")

    def test_home_rejects_contact_post_submissions(self):
        response = self.client.post(
            reverse("portfolio:home"),
            {
                "name": "Recruiter",
                "email": "recruiter@example.com",
                "message": "Hello",
            },
        )
        self.assertEqual(response.status_code, 405)
