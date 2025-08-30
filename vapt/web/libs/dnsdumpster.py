import requests
import urllib.parse
from bs4 import BeautifulSoup
import json

class dumpster:
	url = "https://dnsdumpster.com"
	host = False
	scanned = False
	result = False
	response = False
	error = False

	def __init__(self,host):
		self.host = host
		self.scanned = False

	
	def scan(self):
		s = requests.session()
		header = {
		"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
		"accept-encoding": "gzip, deflate, br",
		"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
		"cache-control": "max-age=0",
		"content-type": "application/x-www-form-urlencoded",
		"origin": "https://dnsdumpster.com",
		"referer": "https://dnsdumpster.com/",
		"sec-ch-ua": '"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"',
		"sec-ch-ua-mobile": "?0",
		"sec-ch-ua-platform": '"Windows"',
		"sec-fetch-dest": "document",
		"sec-fetch-mode": "navigate",
		"sec-fetch-site": "same-origin",
		"sec-fetch-user": "?1",
		"upgrade-insecure-requests": "1",
		"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"
		}
		r = s.get(self.url)
		csrftoken = r.cookies.get('csrftoken')
		if not csrftoken:
			# Handle the error gracefully, maybe return an empty result or raise an exception
			print("Could not find CSRF token.")
			return
		data = {"csrfmiddlewaretoken": csrftoken,
				"targetip":self.host,
				"user":"free"
				}
		self.response = s.post(self.url,data = data,headers = header)
		if self.response.status_code == 200:
			self.scanned = True
		if 'There was an error getting results. Check your query and try again.' in self.response.content.decode():
			self.error = 'Check Your domain!!!'
			self.scanned = False
		# return self.response


	def txt_data(self,table):
		data = []
		trs = table.find_all('tr')
		for tr in trs:
			data.append(tr.text.replace('"',""))
		return data

	def retrive_data(self,table):
		value = []
		data = {'dns':'','ip':'','revers_lookup':'','domain':'','country':''}
		trs = table.find_all('tr')
		for tr in trs:
			try:
				td = tr.find_all('td')
				data['dns'] = str(td[0]).split("<br/>")[0].split(">")[-1]
				data['ip'] = str(td[1]).split("<br/>")[0].split(">")[-1]
				data['revers_lookup'] = td[1].find('span').text
				data['domain'] = str(td[2]).split("<br/>")[0].split(">")[-1]
				data['country'] = td[2].find('span').text
				value.append(data)
			except:
				pass
		return value

	def dns(self, table):
		tr = table.findAll('table')[0].findAll('tr')
		values = list()
		for row in tr:
			td = row.findAll('td')
			data = dict()
			td_text_without_span = ''.join(td[0].find_all(string=True, recursive=False))
			data['dns'] = td_text_without_span.strip()
			td_text_without_span = ''.join(td[1].find_all(string=True, recursive=False))
			data['ip'] = td_text_without_span.strip()
			td_text_without_span = ''.join(td[2].find_all(string=True, recursive=False))
			data['domain'] = td_text_without_span.strip()
			values.append(data)
		return json.dumps({'DNS':values})

	def mx(self,table):
		tr = table.findAll('table')[0].findAll('tr')
		values = list()
		for row in tr:
			td = row.findAll('td')
			data = dict()
			td_text_without_span = ''.join(td[0].find_all(string=True, recursive=False))
			data['dns'] = td_text_without_span.strip()
			td_text_without_span = ''.join(td[1].find_all(string=True, recursive=False))
			data['ip'] = td_text_without_span.strip()
			td_text_without_span = ''.join(td[2].find_all(string=True, recursive=False))
			data['domain'] = td_text_without_span.strip()
			values.append(data)
		return json.dumps({'MX':values})


	def txt(self,table):
		tr = table.findAll('table')[0].findAll('tr')
		values = list()
		for row in tr:
			td = row.findAll('td')
			for data in td:
				values.append(data.get_text()[1:-1])
		return json.dumps({'TXT':values})

	def subdomains(self,table):
		tr = table.findAll('table')[0].findAll('tr')
		values = list()
		for row in tr:
			td = row.findAll('td')
			data = dict()
			td_text_without_span = ''.join(td[0].find_all(string=True, recursive=False))
			data['domains'] = td_text_without_span.strip()
			td_text_without_span = ''.join(td[1].find_all(string=True, recursive=False))
			data['ip'] = td_text_without_span.strip()
			td_text_without_span = ''.join(td[2].find_all(string=True, recursive=False))
			data['hosted'] = td_text_without_span.strip()
			values.append(data)
		return json.dumps({'SUBDomain':values})

	def record(self):
		soup = BeautifulSoup(self.response.content, 'html.parser')
		tables = soup.findAll('div',class_="table-responsive")
		data = dict()
		# print(tables)
		data["dns"] = self.dns(tables[0])
		data["mx"] = self.mx(tables[1])
		data["txt"] = self.txt(tables[2])
		data["host"] = self.subdomains(tables[3])
		return data
	
	def result(self):
		if self.scanned:
			data = self.record()
			for key in data:
				new_dict = {}
				for item in data[key]:
					if type(item) == type(dict()):
						new_dict.update(item)
						data[key] = new_dict
			self.result = json.dumps(data)
			return self.result
		elif self.error:
			return {'error':self.error}
		else:
			return {'Status':'scan first!!!'}
		

#if __name__=="__main__":
 	#dns = dumpster("brandzaha.com")
 	#dns.scan()
 	#print(json.loads(dns.result()))
