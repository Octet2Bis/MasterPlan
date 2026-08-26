import requests

test_emails = [
    'david.heylen@wonderbox.com',
    'marie.briandtaillefer@wonderbox.com',
    'blanca.casadosantamaria@accor.com',
    'nonexistent_random_user_12345_xyz@wonderbox.com'
]

url = 'https://login.microsoftonline.com/common/GetCredentialType'
for email in test_emails:
    payload = {'username': email, 'isOtherIdpSupported': True}
    try:
        r = requests.post(url, json=payload, headers={'User-Agent': 'Mozilla/5.0'}, timeout=3.0)
        data = r.json()
        if_exists = data.get('IfExistsResult') # 0 = Exists, 1 = Does not exist, 5 = Federated
        print(f"{email} -> IfExistsResult: {if_exists} (0=Exists, 1=NotExist, 5=Federated)")
    except Exception as e:
        print(f"{email} -> Error: {e}")
