import requests
from bs4 import BeautifulSoup
import json

import requests
from bs4 import BeautifulSoup
import json

class CrtShInfo:
    def __init__(self, id):
        self.id = id
        self.crt_sh_data = {}
        self.url = 'https://crt.sh/?caid='
        self.scan = False

    def get(self):  
        try:
            res = requests.get(self.url + self.id)
            soup = BeautifulSoup(res.content.decode('utf-8'),'html.parser')

            # Extract crt_sh_CA_ID
            ca_id_table = soup.find_all("td", {"class": "outer"})
            if ca_id_table:
                self.crt_sh_data["crt_sh_CA_ID"] = ca_id_table[1].text.strip()

            # Extract text content of all td elements with class "text"
            text_tables = soup.find_all('td', {"class": "text"})
            text_data = []
            for td in text_tables:
                for br in td.find_all('br'):
                    br.replace_with('\n')
                text_data.append(td.text.replace('\n', ' ').strip())
            self.crt_sh_data["Text_Content"] = text_data

            Certificates=[]
            ca_id_table = soup.find("table", {"class": "options"})
            for row in ca_id_table.find_all("tr"):
                td_elements = row.find_all("td")
                if len(td_elements) >= 3:
                    Certificates.append({
                        "crt.sh ID": {"id": td_elements[0].text.strip(), "href": td_elements[0].a['href']},
                        "Not_Before": td_elements[1].text.strip(),
                        "Not_After": td_elements[2].text.strip(),
                        "issuer_Name": {"Name": td_elements[3].text.strip(), "href": td_elements[3].a['href']}
                    })
            self.crt_sh_data["Certificates"] = Certificates    

            Issued_Certificates = []        
            ca_id_table = soup.find_all("table", {"class": "options"})
            tbody = ca_id_table[2]
            for j in tbody.find_all("tr")[1:]:
                cells = j.find_all("td")
                Issued_Certificates.append({
                    "Population": cells[0].text,
                    "Unexpired": cells[1].text,
                    "Expired": cells[2].text,
                    "TOTAL": cells[3].text
                })
            self.crt_sh_data["Issued_Certificates"] = Issued_Certificates    

            data = []
            ca_id_table = soup.find_all("table", {"class": "options"})
            tbody = ca_id_table[3]

            # Extract rows
            for row in tbody.find_all('tr'):
                row_data = [cell.text.strip() for cell in row.find_all(['th', 'td'])]
                if row_data:  # Skip empty rows
                    data.append(row_data)

            # Get maximum column length for each column
            max_lengths = [max(len(str(row[i])) for row in data) for i in range(len(data[0]))] if data else []

            # Print table rows
            for row in data:
                formatted_row = []
                for i in range(len(row)):
                    if i < len(max_lengths):
                        formatted_row.append(str(row[i]).ljust(max_lengths[i]))
                    else:
                        formatted_row.append(row[i])
            self.crt_sh_data["Trust"] = data

            # Extract additional information
            additional_data = {}
            ca_id_tables = soup.find_all("table", {"class": "options"})
            if len(ca_id_tables) >= 5:
                tbody = ca_id_tables[4]
                td_tag = tbody.find('td')
                if td_tag:
                    td_text = td_tag.get_text(strip=True)
                    additional_data["td_text"] = td_text
                a_tag = tbody.find('a')
                if a_tag:
                    href_value = a_tag.get('href')
                    additional_data["href_value"] = href_value

            self.crt_sh_data["Additional_Info"] = additional_data

        except requests.RequestException as e:
            print(f"An error occurred: {e}")

    def result(self):
        result_json = json.dumps(self.crt_sh_data, indent=2, ensure_ascii=False).replace('\n', ' ')
        return result_json
    
# if __name__ == "__main__":
#     crt_sh_info = CrtShInfo("247106")
#     crt_sh_info.get()
#     crt_sh_result = crt_sh_info.result()
#     print("\nCrt.sh Information:\n", crt_sh_result)
