from django import forms
from .models import ContactMessage


class ContactForm(forms.ModelForm):
    website = forms.CharField(required=False, widget=forms.HiddenInput)

    class Meta:
        model = ContactMessage
        fields = ("name", "email", "company", "message")
        widgets = {
            "name": forms.TextInput(attrs={"placeholder": "Your name", "autocomplete": "name"}),
            "email": forms.EmailInput(attrs={"placeholder": "you@company.com", "autocomplete": "email"}),
            "company": forms.TextInput(attrs={"placeholder": "Company or team (optional)", "autocomplete": "organization"}),
            "message": forms.Textarea(attrs={"placeholder": "Tell me about the problem, opportunity, or collaboration.", "rows": 5}),
        }

    def clean_website(self):
        value = self.cleaned_data.get("website", "")
        if value:
            raise forms.ValidationError("Spam detected.")
        return value
