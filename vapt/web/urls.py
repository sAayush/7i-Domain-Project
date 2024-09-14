from django.urls import path
from . import active
from django.contrib.auth import views as auth_view

urlpatterns = [
    path('', active.login_user, name="login_user"),
    path("home",active.home, name="home"),
    path("search_data/", active.search_data, name="search_data"),
    path('register/', active.register, name='register'),
    path('logout/', active.logout_user , name="logout"),
    path("whois/",active.whois, name="whois"),
    path("dnsdump/",active.dnsdump, name="dnsdump"),
    path("vrtotal/",active.vrtotal, name="vrtotal"),
    # path("dnsview_info/", active.dnsview_info, name="dnsview_info"),
    path("fuzz/",active.fuzz,name="fuzz" ), # done
    path("buildwith/",active.buildwithscan,name="buildwith" ), # done
    path("cmsscan/",active.cmsscan,name="cmsscan" ), # done
    path("nmap/",active.nmapscan,name="nmap" ), # done
    path("waf/",active.wafscan,name="waf" ), 
    path("wpscanning/",active.wpscanning,name="wpscanning" ),
    path("crt_info/",active.crt_info,name="crt_info" ),
    path("ssl_info/",active.ssl_info, name="ssl_info"),
    path("crtidnum/", active.crtidnum , name="crtidnum"),
    path("cetid/", active.cetid, name="cetid"),
    path("pcheck/", active.pcheck, name="pcheck"), # to check the above process status
    path("pkill/", active.pkill, name="pkill"), # to kill the above process
 ]
  