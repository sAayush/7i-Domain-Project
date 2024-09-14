import json
import httpx
import asyncio
import sys

# domain = "brandzaha.com"
# url = f"https://www.virustotal.com/ui/search?limit=20&relationships[comment]=author,item&query=http://{domain}"
# headers = {
#     "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0",
#     "X-Tool": "vt-ui-main",
#     "X-VT-Anti-Abuse-Header": "MTA3OTM2NjUwMjctWkc5dWRDQmlaU0JsZG1scy0xNjMxMTE3NzQyLjY1",
#     "Accept-Ianguage": "en-US,en;q=0.9,es;q=0.8",
# }
# async def send_http2_request():
#         async with httpx.AsyncClient(http2=True) as client:
#             response = await client.get(url, headers=headers)

#         if response.status_code == 200:
#             try:
#                 data = response.json()
#                 return (data['data'])
#             except Exception as e:
#                 return ("Failed to parse JSON response:", e)
#         else:
#             return f"HTTP/2 Request failed with status code: {response.status_code}"

# data = asyncio.run(send_http2_request())
# print(data)


class vtotal:
    url = "https://www.virustotal.com/ui/search?limit=20&relationships[comment]=author,item&query=http://domain"
    headers = {
    "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0",
    "X-Tool": "vt-ui-main",
    "X-VT-Anti-Abuse-Header": "MTA3OTM2NjUwMjctWkc5dWRDQmlaU0JsZG1scy0xNjMxMTE3NzQyLjY1",
    "Accept-Ianguage": "en-US,en;q=0.9,es;q=0.8",
    }

    def __init__(self,domain:str):
        self.url = self.url.replace("domain",domain)

    async def send_http2_request(self):
        async with httpx.AsyncClient(http2=True) as client:
            response = await client.get(self.url, headers=self.headers)

        if response.status_code == 200:
            try:
                data = response.json()
                return (data['data'])
            except Exception as e:
                return ("Failed to parse JSON response:", e)
        else:
            return f"HTTP/2 Request failed with status code: {response.status_code}"

    async def result(self):
        return await self.send_http2_request()
    
# if __name__=="__main__":        
#     vt=vtotal('brandzaha.com') 
#     dat = await vt.result()
#     print(dat)        
