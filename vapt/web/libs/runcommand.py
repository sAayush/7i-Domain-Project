import subprocess
import os
import re
import time
# import secrets
import random
import psutil
import logging
logging.basicConfig(filename='example.log', encoding='utf-8', level=logging.DEBUG)

class runcommand:
    def __init__(self,command,seed):
        self.command = command
        self.logger = "web/log/"
        self.scancode = None
        self.process = None
        self.seed = seed
    
    @staticmethod
    def code_gen(self):
        random.seed(self.seed + str(time.time()))
        code = hash(random.randint(111111, 999999))
        return code
    
    def scode(self):
        return self.scancode
    
    def start(self):
        self.scancode = self.code_gen(self)
        self.logger += str(self.scancode) + '.txt'
        try:
            with open(self.logger,'a') as log:
                process = subprocess.Popen(
                    self.command,
                    shell=True,
					stdout=log,
					stderr=subprocess.PIPE,
					universal_newlines=True,
					text=True,
					bufsize=1,
					close_fds=True
                )
                self.process = process
        except Exception as e:
            print("An error occurred: ",e)
    
    def result(self):
        if self.process.poll() is None:
            return False
        else:
            output = open(self.logger,'r').read()
            return output
    
    def kill(self):
        proc_pid = self.process.pid
        process = psutil.Process(proc_pid)
        for proc in process.children(recursive=True):
            proc.kill()
        process.kill()
        return "true"