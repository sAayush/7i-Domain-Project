import json
import requests
from iteration_utilities import unique_everseen

class buildwith:
    def __init__(self,domain) -> None:
        self.token = '84594b61-77c1-4e33-97fe-735596850773'
        self.url = 'https://api.builtwith.com/v21/api.json'
        self.lookup = domain
        self.json = self.scan()
    
    def scan(self):
        url = self.url + '?key=' + self.token + '&LOOKUP=' + self.lookup
        res = requests.get(url)
        jsondata = json.loads(res.content.decode('utf-8'))
        data = []
        for path in jsondata['Results'][0]['Result']['Paths']:
            for tech in path['Technologies']:
                categ = ''
                if 'Categories' in tech:
                    categ =((tech['Categories']))
                name = ((tech['Name']))
                desc = ((tech['Description']))
                link = ((tech['Link']))
                tag = ((tech['Tag']))
                data.append(self.struct(name,desc,link,tag,categ))
        data = list(unique_everseen(data))
        return data
    
    def struct(self,name,desc,link,tag,categories=''):
        data = {
                    'Categories' : categories,
                    'Name' : name,
                    'Description' : desc,
                    'Link' : link,
                    'Tag' : tag
                }
        return data