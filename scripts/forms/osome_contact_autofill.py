"""
Autofill Osome UAE contact form for VibeLab.

This script opens the form, fills the visible fields, and STOPS before submitting.
Run locally with:
  pip install playwright
  playwright install chromium
  python scripts/forms/osome_contact_autofill.py

Important: review the form manually before clicking submit.
"""

from playwright.sync_api import sync_playwright

URL = "https://osome.com/ae/contact-us/#contact-us-form"

DATA = {
    "name": "Soheil",
    "email": "soheil.power@gmail.com",
    "phone": "+1-2085033653",
    "interested": "Business setup",
    "question": """Hello Osome team,

I am exploring UAE company setup options for VibeLab, an AI-powered learning and portfolio platform for creators, freelancers and small businesses. The platform is live at https://v2.vibelab.ir and currently runs on Cloudflare Workers with Cloudflare D1 database.

VibeLab helps non-technical users build AI content kits, live websites/MVPs, resume-ready portfolios and job-finding workflows. We are preparing the product for a six-week AI program and potential UAE/MENA expansion.

I would like guidance on the best UAE setup option for an AI education/software startup, including Free Zone vs Mainland, licensing activity, founder visa options, bank account setup, expected costs, and timeline.

Please contact me at soheil.power@gmail.com or +1-2085033653.

Best,
Soheil
VibeLab""",
}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    page.goto(URL, wait_until="networkidle")

    page.fill('#lead-form-name-contact-us-form', DATA["name"])
    page.fill('#lead-form-email-contact-us-form', DATA["email"])

    # Some Osome variants render phone only after hydration or in a different form.
    for selector in ['input[name="Phone"]', 'input[type="tel"]', 'input[placeholder*="phone" i]']:
        try:
            if page.locator(selector).count() > 0:
                page.fill(selector, DATA["phone"])
                break
        except Exception:
            pass

    # The Interested field is readonly and may need dropdown interaction.
    try:
        page.click('#lead-form-interested-in-contact-us-form')
        page.get_by_text(DATA["interested"], exact=False).first.click(timeout=3000)
    except Exception:
        # Fallback: force set the readonly input so the user can review it.
        page.evaluate("""value => {
          const el = document.querySelector('#lead-form-interested-in-contact-us-form');
          if (el) { el.removeAttribute('readonly'); el.value = value; el.dispatchEvent(new Event('input', { bubbles: true })); }
        }""", DATA["interested"])

    page.fill('textarea[name="Question"]', DATA["question"])

    print("Form filled. Review in the browser. This script does NOT submit the form.")
    page.pause()
    browser.close()
