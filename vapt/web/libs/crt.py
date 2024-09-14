import requests
from bs4 import BeautifulSoup
import json

class certificate:
    def __init__(self,domain):
        self.domain = domain
        self.store = []
        self.url = 'https://crt.sh/?q='
        self.scan = False
    
    def get(self):
        res = requests.get(self.url + self.domain)
        soup = BeautifulSoup(res.content.decode('utf-8'),'html.parser')
        table = soup.find_all("table")
        tbody = table[1]
        store = []
        for tr in tbody.find_all("tr"):
            tmp = []
            for td in tr.find_all("td"):
                tmp.append(td)
            store.append(tmp)
        for i in range(2,len(store)):
            test = store[i]
            data = {
                        'ID':{'id':test[0].get_text(),'href':test[0].a['href']},
                        'loggedAt': test[1].get_text(),
                        'NotBefore': test[2].get_text(),
                        'NotAfter': test[3].get_text(),
                        'CommonName': test[4].get_text(),
                        'MatchingIdentities': test[5].get_text().split('\n'),
                        'IssuerName': {'name':test[6].get_text(),'href':test[6].a['href']}
                    }
            self.store.append(data)
        self.scan = True
    
    def result(self):
        if self.scan:
            return json.dumps(self.store,indent=2)
        else:
            raise Exception("scan is done")

# if __name__=="__main__":
#     data = certificate('ovo.id')
#     data.get()
#     result = data.result()
#     print(result)