import requests
import json
import re

class dnsvie:
    def __init__(self,domain,scantype) -> None:
        self.token = 'be095bcc64fab1b2173b8ad878953fcd843b6d48'
        self.url = f'https://api.viewdns.info/_api_/?_query_&apikey={self.token}&output=json'
        self.apis = {
                        'prop':['propagation','domain'],
                        'iphis':['iphistory','domain'],
                        'tracer':['traceroute','domain'],
                        'revip':['reverseip','host'], # page
                        'revdns':['reversedns','ip'],
                        'revmx':['reversemx','mx'], # page
                        'revns':['reversens','ns'], # page
                        'revwhois':['reversewhois','q'] # page and for Paid
                    }
        self.domain = domain
        self.scantype = scantype
        if self.scantype not in self.apis:
            raise Exception("scan type not found")
        if not self.check():
            raise Exception("Error in your domain/ip/NS/MX value")
        self.result = self.scan()
    
    def check(self):
        mx_record_pattern = re.compile(r'^([a-zA-Z0-9.-]+)$')
        ipv4_pattern = re.compile(r'^\d{1,3}(\.\d{1,3}){3}$')
        ipv6_pattern = re.compile(
                                    r'^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}(:|$))'
                                    r'|(([0-9a-fA-F]{1,4}:){1,7}:|:([0-9a-fA-F]{1,4}:){1,6}|'
                                    r'([0-9a-fA-F]{1,4}:){2,6}:|:([0-9a-fA-F]{1,4}:){1,5}'
                                    r'|:([0-9a-fA-F]{1,4}:){1,4}:|:([0-9a-fA-F]{1,4}:){1,3}'
                                    r'|:([0-9a-fA-F]{1,4}:){1,2}:|:([0-9a-fA-F]{1,4}:){1}|:'
                                    r'([0-9a-fA-F]{1,4}:){1,7}|:|::)'
                                    r'([0-9a-fA-F]{1,4}:){1,7}[0-9a-fA-F]{1,4}$'
                                )
        if self.scantype == 'revdns':
            return bool(re.match(ipv4_pattern, self.domain) or re.match(ipv6_pattern, self.domain))
        elif self.scantype == 'revmax' or self.scantype == 'revns':
            return bool(re.match(mx_record_pattern, self.domain))
        else:
            return True
            

    def scan(self):
        url = self.url.replace('_api_',self.apis[self.scantype][0]).replace('_query_',(self.apis[self.scantype][1] + '=' + self.domain))
        res = requests.get(url)
        return json.loads(res.content.decode('utf-8'))

if __name__ == "__main__":
    scanner = dnsvie("w3schools.com",'prop')
    result = scanner.result
    print(result)
