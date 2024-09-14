from . import runcommand
import time
import requests
import json

class wpscan:
    def __init__(self,domain) -> None:
        self.domain = domain
        self.url = self.urlcheck()
        self.process = None
        self.command = f"wpscan --url {self.url} -eap -eat -eu --no-update --random-user-agent -o 'web/wpscan/{self.domain}.json' --format json"
    
    def start(self):
        self.process = runcommand.runcommand(self.command,"wpscan")
        self.process.start()

    def urlcheck(self):
        url = "http://"+self.domain
        res = requests.get(url)
        return res.url

    def kill(self):
        return self.process.kill()

    def result(self):
        if self.process.result() != False:
            return json.loads(open("web/wpscan/" + self.domain + '.json','r').read())
        else:
            return self.process.result()

    def code(self):
        return self.process.scode()
        
#if __name__ == "__main__":
 #   domain = input("Enter the domain to scan: ")
   # wp_scan = wpscan(domain)
  #  wp_scan.start()
   # print("Scanning initiated. Please wait...")
   # time.sleep(3)  # Adjust the delay as needed
   # while True:
    #    if wp_scan.result() == False:
     #        pass
      #  else:
       #     print("Scan completed.")
        #    print(wp_scan.result())
         #   break        
