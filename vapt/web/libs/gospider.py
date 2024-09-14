from . import runcommand
import time
import re
import requests

class gospider:
	def __init__(self,domain):
		self.domain = domain
		self.url = self.check()
		self.process = None

	def check(self):
		req = requests.get(f'http://{self.domain}')
		return req.url

	def start(self):
		command = f'gospider -s {self.url} -d 2 --sitemap --robots -w -r'
		self.process = runcommand.runcommand(command)
		self.process.start()

	def result(self):
		return self.process.result()

	def code(self):
		return self.process.scode()
	
	def kill(self):
		return self.process.kill()