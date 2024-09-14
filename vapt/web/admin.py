from django.contrib import admin
from .models import dnsviewdata,CRTInfo,SSLInfo,crti_Info,CETID_data,whoisInfo,dnsdumpsterInfo,VirusTotalScan,buildwithinfo,cmsscaninfo
from .models import wpsinfo,fuzzerinfo,nmapinfo,wafinfo

# Register your models here.
admin.site.register(dnsviewdata)
admin.site.register(CRTInfo)
admin.site.register(SSLInfo)
admin.site.register(crti_Info)
admin.site.register(CETID_data)
admin.site.register(whoisInfo)
admin.site.register(dnsdumpsterInfo)
admin.site.register(VirusTotalScan)
admin.site.register(buildwithinfo)
admin.site.register(cmsscaninfo)
admin.site.register(wpsinfo)
admin.site.register(fuzzerinfo)
admin.site.register(nmapinfo)
admin.site.register(wafinfo)