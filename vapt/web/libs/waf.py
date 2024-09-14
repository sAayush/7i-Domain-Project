from . import runcommand
import time
import requests
import re
import json

class waf:
	def __init__(self,domain):
		self.domain = domain
		self.url = self.urlcheck()
		self.command = f'wafw00f {self.url} -o web/waf/{self.domain}.txt'
		self.process = None
		
	
	def urlcheck(self):
		url = "http://"+self.domain
		res = requests.get(url)
		return res.url

	def start(self):
		self.process = runcommand.runcommand(self.command,"waf")
		self.process.start()

	def result(self):
		if self.process.result():
			data = open(f'web/waf/{self.domain}.txt','r').read().strip()
			if "None (None)" in data:
				return json.dumps({"WAF":"Not Found"})
			else:
				return json.dumps({"WAF":re.findall(r"\S*   ([\S\s]*)",data)[0]})
		else:
			return self.process.result()

	def code(self):
		return self.process.scode()
	
	def kill(self):
		return self.process.kill()

# if __name__ == "__main__":
#     prob = waf("brandzaha.com")
#     prob.start()
#     print(prob.code())
#     time.sleep(3)
#     # prob.kill()
#     while True:
#         if prob.result() == False:
#             pass
#         else:
#             print(prob.result())
#             break