import subprocess


def test_js_currency_formatting():
    js_code = "console.log(new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'}).format(1234.56))"
    output = subprocess.check_output(['node', '-e', js_code], text=True).strip()
    assert output == '$1,234.56'
