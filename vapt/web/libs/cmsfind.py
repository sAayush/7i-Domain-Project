
import re
import json
import time
from . import runcommand
import requests

pattern = "re.sub(r'\x1b\[H','',re.sub(r'\x1b\[[0-9;]+J','',(re.sub(r'\x1b\[[0-9;]+m', '', data))))"

class cmsfind:
    def __init__(self,domain) -> None:
        self.domain = domain
        self.url = self.urlcheck()
        self.proc = None

    def urlcheck(self):
        url = "http://"+self.domain
        res = requests.get(url)
        return res.url
    
    def start(self):
        command = f"cmseek -u {self.url} --user-agent 'Mozilla 5.0' --batch -o"
        process = runcommand.runcommand(command,"cms")
        self.proc = process
        self.proc.start()
        print(self.code())
    
    def code(self):
        return self.proc.scode()
    
    def kill(self):
        return self.proc.kill()
    
    def result(self):
        output = self.proc.result()
        print(output)
        if output != False:
            output = re.sub(r'\x1b\[H','',re.sub(r'\x1b\[[0-9;]+J','',(re.sub(r'\x1b\[[0-9;]+m', '', output))))
            if 'CMS detction failed!' in output:
                return json.dumps({'CMS':"CMS Not Found"})
            else:
                return json.dumps({'CMS':(re.findall(r'CMS: (\S*)',output)[0])})
        else:
            return False


# if __name__ == "__main__":
#     prob = cmsfind("ovo.id")
#     prob.start()
#     time.sleep(3)
#     # prob.kill()
#     while True:
#         if prob.result() == False:
#             pass
#         else:
#             print(prob.result())
#             break
