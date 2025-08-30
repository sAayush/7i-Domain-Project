import requests
from bs4 import BeautifulSoup
import json

class Certificate:
    def __init__(self, domain):
        self.domain = domain
        self.store = []
        self.url = 'https://decoder.link/sslchecker/'
        self.scan = False
    
    def get(self):
        try:
            res = requests.get(self.url + self.domain + "/443", timeout=10)
            res.raise_for_status() # Raise an exception for bad status codes like 404 or 500
            soup = BeautifulSoup(res.content.decode('utf-8'), 'html.parser')
        except requests.RequestException as e:
            print(f"Failed to retrieve SSL data for {self.domain}: {e}")
            self.scan = True # Mark as scanned to prevent 'not done' error
            self.store.append({"error": f"Could not connect to SSL checker for {self.domain}"})
            return

        data = {}

        # Issue
        issues = soup.find('div', {"class": "v-alert__wrapper"})
        data["issue"] = issues.text.strip() if issues else "No issues reported."

        # Main content div
        main_content = soup.find('div', {"class": "flex xs12 sm10 offset-sm1"})
        if not main_content:
            print(f"Could not find main content block for {self.domain}")
            self.scan = True
            self.store.append({"error": "Failed to parse SSL checker page structure."})
            return

        # All tables within the main content
        tables = main_content.find_all("table")

        # Report (Table 1)
        report = []
        if len(tables) > 0:
            for ssl_info in tables[0].find_all("tr"):
                cells = ssl_info.find_all("td")
                if len(cells) > 1 and ssl_info.find("i"):
                    report.append({
                        "Key": cells[0].text.strip(),
                        "Icon": ssl_info.find("i").text,
                        "Value": cells[1].text.replace('done', '').strip()
                    })
        data["Report"] = report

        # DNS Info (Table 2)
        dns_info = []
        if len(tables) > 1:
            for ssl_info in tables[1].find_all("tr"):
                cells = ssl_info.find_all("td")
                if len(cells) > 1 and ssl_info.find("span"):
                    dns_info.append({
                        "Key": cells[0].text.strip(),
                        "Icon": ssl_info.find("span").text,
                        "Value": cells[1].text.replace('done', '').strip()
                    })
        data["DNS"] = dns_info

        # General Info (Table 3)
        general_info = []
        if len(tables) > 2:
            for ssl_info in tables[2].find_all("tr"):
                cells = ssl_info.find_all("td")
                if len(cells) > 1 and ssl_info.find("span"):
                    general_info.append({
                        "Key": cells[0].text.strip(),
                        "Icon": ssl_info.find("span").text,
                        "Value": cells[1].text.replace('done', '').strip()
                    })
        data["General_Information"] = general_info
        
        # OpenSSL Handshake
        openssl = soup.find('div', {'class': 'pre-wrapper'})
        if openssl and openssl.find("pre"):
            data["OpenSSL_Handshake"] = {"OpenSSL_Handshake": openssl.find("pre").text}
        else:
            data["OpenSSL_Handshake"] = {"OpenSSL_Handshake": "Not found."}
        
        self.store.append(data)
        self.scan = True
    
    @staticmethod
    def convert_sets_to_lists(obj):
        if isinstance(obj, set):
            return list(obj)
        elif isinstance(obj, list):
            return [Certificate.convert_sets_to_lists(item) for item in obj]
        elif isinstance(obj, dict):
            return {key: Certificate.convert_sets_to_lists(value) for key, value in obj.items()}
        else:
            return obj
    
    def result(self):
        if self.scan:
            return json.dumps(self.store, indent=2)
        else:
            raise Exception("Scan is not done")

# if __name__ == "__main__":
#     data = Certificate('www.sarkariresult.com')
#     data.get()
#     result = data.result()
#     print(result)
