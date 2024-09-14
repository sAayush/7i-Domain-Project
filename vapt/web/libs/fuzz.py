from . import runcommand
import requests
import re
import time
import json

class fuzzer:
    def __init__(self,domain,wordlist='web/wordlist/wordlist.txt'):
        self.domain = domain
        self.url = self.urlcheck()
        self.wordlist = wordlist
        self.output = list()
        self.proc = None

    def urlcheck(self):
        url = "http://" + self.domain
        res = requests.get(url)
        return res.url
    
    def start(self):
        command = f"wfuzz -u {self.url}/FUZZ -w {self.wordlist} --sc 200"
        process = runcommand.runcommand(command,'fuzz')
        self.proc = process
        self.proc.start()
    
    def code(self):
        return self.proc.scode()
    
    def result(self):
        output = self.proc.result()
        if output != False:
            output = output.split('\n')
            data = output[12:]
            filter_data = []
            for row in data:
                if len(row) > 1 and row != '\x1b[0K\x1b[1A\n':
                    row = row.replace('\x1b[','').replace('0m','')
                    try:
                        code = re.findall('\d*:\s*(\d{3})',row)[0]
                        length = re.findall('\d*\sL',row)[0].split()[0]
                        word = re.findall('\d*\sW',row)[0].split()[0]
                        total_char = re.findall('\d*\sCh',row)[0].split()[0]
                        find = re.findall('\"(.*?\w)\"',row)[0].split(' - ')[0]
                        filter_data.append(json.dumps({
                            "code": code,
                            "length": length,
                            "word": word,
                            "total_char": total_char,
                            "find": find
                        }))
                    except Exception as e:
                        pass
            return filter_data
        else:
            return False
    
    def kill(self):
        return self.proc.kill()

# if __name__ == "__main__":
#     prob = fuzzer("ovo.id")
#     prob.start()
#     time.sleep(3)
#     prob.kill()
#     while True:
#         if prob.result() == False:
#             pass
#         else:
#             print(prob.result())
#             break