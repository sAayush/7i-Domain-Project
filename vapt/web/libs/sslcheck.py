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
        res = requests.get(self.url + self.domain+"/443")
        soup = BeautifulSoup(res.content.decode('utf-8'), 'html.parser')
        data = {}

        # Issue
        issues = soup.find('div', {"class": "v-alert__wrapper"})
        data["issue"] = issues.text.strip()

        # Report
        report = []
        ssl = soup.find('div', {"class": "flex xs12 sm10 offset-sm1"})
        table = ssl.find_all("table")[0]
        for ssl_info in table.find_all("tr"):
            cells = ssl_info.find_all("td")
            report.append({
                "Key": cells[0].text.strip(),
                "Icon": ssl_info.find("i").text,
                "Value": cells[1].text.replace('done', '').strip()
            })
        data["Report"] = report

        # DNS Information
        dns_info = []
        table = soup.find_all("table")[1]
        for ssl_info in table.find_all("tr"):
            cells = ssl_info.find_all("td")
            dns_info.append({
                "Key": cells[0].text.strip(),
                "Icon": ssl_info.find("span").text,
                "Value": cells[1].text.replace('done', '').strip()
            })
        data["DNS"] = dns_info

        # General Information
        general_info = []
        table = soup.find_all("table")[2]
        for ssl_info in table.find_all("tr"):
            cells = ssl_info.find_all("td")
            general_info.append({
                "Key": cells[0].text.strip(),
                "Icon": ssl_info.find("span").text,
                "Value": cells[1].text.replace('done', '').strip()
            })
        data["General_Information"] = general_info

        # Chain Information
        # chain_info = []
        # chain_heading = soup.find_all('h4', {"class": "pt-3 pb-3"})[0].text.strip()
        
        # data[chain_heading] = chain_info

        # Certificates
        certificate_info = {}
        tables = soup.find_all("table")
        for i, issue in enumerate(soup.find_all('h4', {"class": "pt-3 pb-3"}), start=1):
            cert_info = []
            if len(tables) > i:
                table = tables[i]
                for ssl_info in table.find_all("tr"):
                    cells = ssl_info.find_all("td")
                    cert_info.append({
                        "Key": cells[0].text.strip(),
                        "Icon": ssl_info.find("span").text,
                        "Value": cells[1].text.replace('done', '').strip()
                    })
            certificate_info[issue.text.strip()] = cert_info

        data["Certificates"] = certificate_info

        # OpenSSL Handshake
        openssl = soup.find('div', {'class': 'pre-wrapper'})
        data["OpenSSL_Handshake"] = {"OpenSSL_Handshake": openssl.find("pre").text}
        
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
