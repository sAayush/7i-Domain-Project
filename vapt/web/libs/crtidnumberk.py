import requests
from bs4 import BeautifulSoup
import json

class CrtShInfo:
    def __init__(self, id):
        self.domain = id
        self.crt_sh_data = {}
        self.url = 'https://crt.sh/?id='
        self.scan = False

    def get(self):
        res = requests.get(self.url + self.domain)
        soup = BeautifulSoup(res.content.decode('utf-8'), 'html.parser')

        # data = {}

        # Extract the CRTH ID : # Extract the Summary
        crt_sh_ID = []
        summar = soup.find_all("td", {"class": "outer"})
        if summar:
            ID = summar[1].text
            summary = summar[2].text
            crt_sh_ID = {
                "ID": ID,
                "summary": summary,
            }
            

        # Extract the Certificate Transparency
        certificate_transparency = []
        transparency_table = soup.find("table", {"style": "margin-left:0px"})
        for row in transparency_table.find_all("tr")[3:]:
            timestamp = row.find("td").text
            entry_number = row.find_all("td")[1].text
            log_operator = row.find_all("td")[2].text
            log_url = row.find_all("td")[3].text
            certificate_transparency.append({
                "Timestamp": timestamp,
                "Entry #": entry_number,
                "Log Operator": log_operator,
                "Log URL": log_url
            })
            

        # Extract the Revocation
        revocation = []
        revocation_table = soup.find_all("table", {"class": "options"})
        tbody = revocation_table[1]
        for row in tbody.find_all("tr"):
            cells = row.find_all("td")
            if cells:
                mechanism = cells[0].text
                provider = cells[1].text
                status = cells[2].text
                revocation_date = cells[3].text
                last_observed_crl = cells[4].text
                last_checked = cells[5].text

                revocation.append({
                    "Mechanism": mechanism,
                    "Provider": provider,
                    "Status": status,
                    "Revocation Date": revocation_date,
                    "Last Observed in CRL": last_observed_crl,
                    "Last Checked": last_checked
                })

        # Extract the Certificate Fingerprints
        fingerprints = []
        fingerprints_table = soup.find_all("table", {"class": "options"})
        tbody = fingerprints_table[2]
        for row in tbody.find_all("tr"):
            cells = row.find_all("td")
            fingerprint = {
                "SHA_256": {"sha_256": cells[0].text.strip(), "href": cells[0].a['href']},
                "sha_1": cells[2].text.strip()
            }
            fingerprints.append(fingerprint)

        # Certificate
        text_data = []
        table = soup.find_all('td', {"class": "text"})
        for td in table:
            for br in td.find_all('br'):
                br.replace_with('\n')
            # Replace newline characters ("\n") with an empty string
            text_data.append(td.text.replace('\n', ' ').strip())
            
        self.crt_sh_data["crt_sh_ID"] = crt_sh_ID    
        self.crt_sh_data["Certificate Transparency"] = certificate_transparency
        self.crt_sh_data["Revocation"] = revocation
        self.crt_sh_data["Certificate Fingerprints"] = fingerprints
        self.crt_sh_data["Certificate"] = text_data

    def result(self):
        # Replace newline characters ("\n") before converting to JSON
        result_json = json.dumps(self.crt_sh_data, indent=2, ensure_ascii=False).replace('\n', ' ')
        return result_json

# if __name__ == "__main__":
#     crt_sh_info = CrtShInfo("12041014314")
#     crt_sh_info.get()
#     crt_sh_result = crt_sh_info.result()
#     print("\nCrt.sh Information:\n", crt_sh_result)
