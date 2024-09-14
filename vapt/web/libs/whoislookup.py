import whois
import json

class lookup():
	scan_done = False
	w = False
	data = dict()

	def __init__(self,url):
		self.url = url
		self.scan_done = False

	def scan(self):
		self.w = whois.whois(self.url)
		if self.w['domain_name'] != None:
			self.scan_done = True
		else:
			self.data = {"error":"Check the domain again"}

	def result(self):
		if self.scan_done:
			for i in self.w.keys():
				self.data[i] = self.w[i]
		else:
			self.data = {"error": "Scan is not done"}

		return json.dumps(self.data, sort_keys=True, default=str)
