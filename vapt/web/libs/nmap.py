from . import runcommand
import json
# import xmltodict
import xml.etree.ElementTree as ET
import re

class nmap:
    def __init__(self,ip) -> None:
        self.ip = ip
        self.proc = None
        self.pattern = re.compile(r"(\d+\/(tcp|udp)\s+\w+\s+\w+\s+[^\n]+(?:\n[^\n]+(?:\| [^\n]+)*)*)")
    
    def code(self):
        return self.proc.scode()

    def start(self):
        # command = f'nmap {self.ip} -sC -sV -T4 -A -oX web/nmap/{self.ip}.xml'
        command = f'nmap {self.ip} -sC -sV -T4 -A'
        self.proc = runcommand.runcommand(command,'nmap')
        self.proc.start()

    def kill(self):
        self.proc.kill()

    def result(self):
        if self.proc.result():
            matched = re.findall(self.pattern, self.proc.result())
           
            return matched
        else:
            return self.proc.result()

    def nmapdata(self,xml_data):
        # Parse the XML data
        root = ET.fromstring(xml_data)
       
        # Find all <port> tags
        port_tags = root.findall('.//port')
       
        # Extract keys dynamically from the first <port> tag
        port_keys = [attr for attr in port_tags[0].attrib]

        # Extract information from each <port> tag
        data_list = []

        for port_elem in port_tags:
            port_data = {key: port_elem.get(key) for key in port_keys}
            
            # Extract information from all tags within the <port> tag
            for elem in port_elem:
                if elem.tag == 'state':
                    port_data['state'] = {key: elem.get(key) for key in elem.attrib}
                elif elem.tag == 'service':
                    port_data['service'] = {key: elem.get(key).replace('\\r\\n', '\n').replace('\\x20','\n') for key in elem.attrib}
                elif elem.tag == 'script':
                    port_data['script'] = {key: elem.get(key).replace('\\r\\n', '\n').replace('\\x20','\n') for key in elem.attrib}
            
            data_list.append(port_data)

        # Print all the data within each <port> tag
        return json.dumps(data_list,indent=2)

# if __name__ == "__main__":
#     prob = nmap("ovo.id")
#     prob.start()
#     print(prob.code())
#     # prob.kill()
#     while True:
#         if prob.result() == False:
#             pass
#         else:
#             print(prob.result())
#             break
