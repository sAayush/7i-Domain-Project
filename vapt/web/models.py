from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class whoisInfo(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE )
    domain = models.CharField(max_length=100)
    whois = models.TextField()
    created_at = models.DateTimeField(default=timezone.now, blank=True)
    
    def __str__(self):
        return f"{self.domain}"
    
class dnsdumpsterInfo(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    domain = models.CharField(max_length=100)
    dnsdumpster = models.TextField()
    created_at = models.DateTimeField(default=timezone.now, blank=True)
    
    def __str__(self):
        return f"{self.domain}"
    
class VirusTotalScan(models.Model):
    domain = models.CharField(max_length=100)
    vir_result = models.JSONField(null=True,blank=True)
    created_at = models.DateTimeField(default=timezone.now, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    def __str__(self):
        return f"{self.domain}"    
    
class dnsviewdata(models.Model):
    domain = models.CharField(max_length=100)
    scan_type = models.CharField(max_length=100)
    dnsview_result = models.TextField()
    created_at = models.DateTimeField(default=timezone.now, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    def __str__(self):
        return f"{self.domain} - {self.scan_type}" 
  

class CRTInfo(models.Model):
    domain = models.CharField(max_length=100)
    crtdata = models.TextField()
    created_at = models.DateTimeField(default=timezone.now, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    def __str__(self):
        return f"{self.domain}" 

class SSLInfo(models.Model):
    domain = models.CharField(max_length=100)
    SSLdata = models.TextField()
    created_at = models.DateTimeField(default=timezone.now, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    def __str__(self):
        return f"{self.domain}" 
    
class crti_Info(models.Model):
    domain = models.CharField(max_length=100)
    cetiddata = models.JSONField(null=True,blank=True)
    created_at = models.DateTimeField(default=timezone.now, blank=True) 
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    def __str__(self):
        return f"{self.domain}" 
    

class CETID_data(models.Model):
    domain = models.CharField(max_length=100)
    crtidata = models.TextField()
    created_at = models.DateTimeField(default=timezone.now, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    def __str__(self):
        return f"{self.domain}" 
    
class buildwithinfo(models.Model):
    domain = models.CharField(max_length=100)
    buildwith = models.JSONField(null=True,blank=True)
    created_at = models.DateTimeField(default=timezone.now, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    def __str__(self):
        return f"{self.domain}"
    
    
    
class cmsscaninfo(models.Model):
    domain = models.CharField(max_length=100)
    cmss = models.TextField()
    created_at = models.DateTimeField(default=timezone.now, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    def __str__(self):
        return f"{self.domain}"
    
class wpsinfo(models.Model):
    domain = models.CharField(max_length=100)
    wpss= models.JSONField(null=True,blank=True)
    created_at = models.DateTimeField(default=timezone.now, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    def __str__(self):
        return f"{self.domain}"
    
class fuzzerinfo(models.Model):
    domain = models.CharField(max_length=100)
    fuzzz= models.TextField()
    created_at = models.DateTimeField(default=timezone.now, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    def __str__(self):
        return f"{self.domain}" 

class nmapinfo(models.Model):
    domain = models.CharField(max_length=100)
    nmape= models.JSONField(null=True,blank=True)
    created_at = models.DateTimeField(default=timezone.now, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    def __str__(self):
        return f"{self.domain}" 
        
class wafinfo(models.Model):
    domain = models.CharField(max_length=100)
    wafee= models.TextField()
    created_at = models.DateTimeField(default=timezone.now, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    def __str__(self):
        return f"{self.domain}"      

    
