from . import runcommand
import time
import requests
import re
import json

class waf:
	def __init__(self,domain):
		self.domain = domain
		self.url = self.urlcheck()
		self.output_dir = "web/waf"
		self.output_file = os.path.join(self.output_dir, f"{self.domain}.txt")
		self.command = None # Will be set in start()
		self.process = None
		
	
	def urlcheck(self):
		"""
		Tries to connect to the domain using HTTPS first, then falls back to HTTP.
		Returns the valid URL or None if unreachable.
		"""
		try:
			url = "https://" + self.domain
			res = requests.get(url, timeout=5, allow_redirects=True)
			if res.status_code < 400:
				return res.url
		except requests.RequestException:
			pass

		try:
			url = "http://" + self.domain
			res = requests.get(url, timeout=5, allow_redirects=True)
			if res.status_code < 400:
				return res.url
		except requests.RequestException as e:
			print(f"Error: Could not connect to {self.domain}. {e}")
			return None


	def start(self):
		if not self.url:
			print("Cannot start WAF scan, URL is invalid or unreachable.")
			return

		# Ensure the output directory exists
		os.makedirs(self.output_dir, exist_ok=True)

		self.command = f'wafw00f {self.url} -o {self.output_file}'
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