import subprocess


def test_js_currency_formatting():
    js_code = "console.log(new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'}).format(1234.56))"
    output = subprocess.check_output(['node', '-e', js_code], text=True).strip()
    assert output == '$1,234.56'


def test_js_value_formatter_handles_none_string():
    js_code = (
        "const f=v=>{if(v===undefined||v===null||v===''||!Number.isFinite(Number(v)))" \
        " return '';return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(v));};" \
        "console.log(f('None'));"
    )
    output = subprocess.check_output(['node', '-e', js_code], text=True).strip()
    assert output == ''
