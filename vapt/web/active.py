import json
import re

from django.shortcuts import render ,redirect
from asgiref.sync import sync_to_async,async_to_sync
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.http import HttpResponse, HttpResponseRedirect

from datetime import datetime
from django.urls import reverse
from django.contrib import messages
from django.contrib.auth.models import User,auth
from django.contrib.auth.decorators import login_required

# importing custom libraries
from .libs.waf import waf
from .libs.nmap import nmap
from .libs.fuzz import fuzzer
from .libs.wpscan import wpscan
from .libs.dnsvie import dnsvie
from .libs.cmsfind import cmsfind
from .libs.buildwith import buildwith
from .models import wpsinfo,wafinfo,nmapinfo
from django.contrib.auth.hashers import make_password
from .libs  import whoislookup,dnsdumpster,virustotal,crt,crtidnumberk,sslcheck,cetidd
from .models import CRTInfo,SSLInfo,CETID_data,crti_Info,whoisInfo,dnsdumpsterInfo,VirusTotalScan,buildwithinfo,cmsscaninfo,fuzzerinfo,dnsviewdata

#  For login
@login_required(login_url='login_user')
def home(request):
    return render(request,'index.html')

#  For register
def register(request):

    if request.method =='POST':
        first_name =request.POST['first_name']
        last_name =request.POST['last_name']
        username =request.POST['username'] 
        email =request.POST['email']
        password = request.POST['password']
        confirm_password =request.POST['confirm_password']

        if password == confirm_password:
            if User.objects.filter(username=username).exists():
                messages.info(request,'email is exist')
                return redirect(register)
            else:
                user=User.objects.create_user(username=username,password=password,email=email,first_name=first_name,last_name=last_name)
                user.set_password(password)
                user.save()
                return redirect('home')
    else:
        return render(request, 'page_register.html')

def login_user(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
     
        # Input validation
        if not (re.match("^[a-zA-Z0-9_]*$", username) and 6 <= len(password) <= 20):
            messages.error(request, 'Invalid username or password format')
            return redirect('login_user')
        
        # User authentication
        user = auth.authenticate(username=username, password=password)
        if user is not None:
            auth.login(request, user)
            return redirect('home')
        else:
            messages.error(request, 'Invalid username or password. Please try again.')
            return redirect('login_user')
    
    return render(request, "page_login.html")
 
# For logout
@login_required(login_url='login_user')
def logout_user(request):
    auth.logout(request)
    
    # Clear session cookies
    request.session.flush()
    
    # Clear any specific cookies you want to remove
    response = HttpResponseRedirect(reverse('login_user'))
    response.delete_cookie('cookie_name')
    
    messages.success(request, 'You have been logged out successfully!')
    return response

# who is lookup
# it will take domain name as input and return the whois information of the domain
@login_required(login_url='login_user')
@csrf_exempt
@require_POST
def whois(request):
    if request.method == 'POST':
        try:
            # Use request.body for JSON data
            data = json.loads(request.body.decode('utf-8'))

            # Access the 'domain' key from the JSON data
            domain = data.get('domain', '')
            w = whoislookup.lookup(domain)
            w.scan()
            data = w.result()
            # print(data)
            # Do something with the 'domain' variable
            whoisInfo.objects.create(user=request.user,domain=domain, whois=data  ,created_at=datetime.now().date() )

            # Return a JSON response
            return HttpResponse(json.dumps({'whois':data}), content_type='application/json')

        except json.JSONDecodeError as e:
            return HttpResponse(json.dumps({'error': 'Invalid JSON format'}), content_type='application/json')

    else:
        return HttpResponse(json.dumps({'error': 'Not POST'}), content_type='application/json')

# dnsdumpster
# it will take domain name as input and return the dnsdumpster information of the domain
@login_required(login_url='login_user')
@csrf_exempt
@require_POST
def dnsdump(request):
    if request.method == 'POST':
        try:
            # Use request.body for JSON data
            data = json.loads(request.body.decode('utf-8'))

            # Access the 'domain' key from the JSON data
            domain = data.get('domain', '')
            # print(domain)
            dns = dnsdumpster.dumpster(domain)
            dns.scan()
            data = dns.result()
            dnsdumpsterInfo.objects.create(user=request.user,domain=domain, dnsdumpster=data  ,created_at=datetime.now().date() )
            
            return HttpResponse(json.dumps({'dnsdumpster':data}), content_type='application/json')

        except json.JSONDecodeError as e:
            return HttpResponse(json.dumps({'error': 'Invalid JSON format'}), content_type='application/json')
    else:
        return HttpResponse(json.dumps({'error': 'Not POST'}), content_type='application/json')
    



@login_required(login_url='login_user')
@csrf_exempt
@require_POST
def crt_info(request):
    if request.method == 'POST':
        try:
            # Use request.body for JSON data
            data = json.loads(request.body.decode('utf-8'))

            # Access the 'domain' key from the JSON data
            domain = data.get('domain', '')
            # print(domain)
            crt_data = crt.certificate(domain)
            crt_data.get()
            cmrt = crt_data.result()
            CRTInfo.objects.create(user=request.user,domain=domain, crtdata=cmrt  ,created_at=datetime.now().date() )

            # Return a JSON response
            return HttpResponse(json.dumps({'crt_data':cmrt}), content_type='application/json')

        except json.JSONDecodeError as e:
            return HttpResponse(json.dumps({'error': 'Invalid JSON format'}), content_type='application/json')
    else:
        return HttpResponse(json.dumps({'error': 'Not POST'}), content_type='application/json')

@login_required(login_url='login_user')
@csrf_exempt
@require_POST
def ssl_info(request):
    if request.method == 'POST':
        try:
            # Use request.body for JSON data
            data = json.loads(request.body.decode('utf-8'))

            # Access the 'domain' key from the JSON data
            domain = data.get('domain', '')
            # print(domain)
            crt_data = sslcheck.Certificate(domain)
            crt_data.get()
            cmrt = crt_data.result()
            SSLInfo.objects.create(user=request.user,domain=domain, SSLdata=cmrt  ,created_at=datetime.now().date())
            # Return a JSON response
            return HttpResponse(json.dumps({'crt_data':cmrt}), content_type='application/json')

        except json.JSONDecodeError as e:
            return HttpResponse(json.dumps({'error': 'Invalid JSON format'}), content_type='application/json')
    else:
        return HttpResponse(json.dumps({'error': 'Not POST'}), content_type='application/json')


#doamin  not requed
@login_required(login_url='login_user')
@csrf_exempt
@require_POST
def cetid(request):
    if request.method == 'POST':
        try:
            # Use request.body for JSON data
            data = json.loads(request.body.decode('utf-8'))

            # Access the 'domain' key from the JSON data
            id = data.get('domain', '')
            crt_data = cetidd.CrtShInfo(id)
            crt_data.get()
            cmrt = crt_data.result()
            CETID_data.objects.create(user=request.user,domain=id, crtidata=cmrt  ,created_at=datetime.now().date())
            # Return a JSON response
            return HttpResponse(json.dumps({'crt_data':cmrt}), content_type='application/json')

        except json.JSONDecodeError as e:
            return HttpResponse(json.dumps({'error': 'Invalid JSON format'}), content_type='application/json')
    else:
        return HttpResponse(json.dumps({'error': 'Not POST'}), content_type='application/json')

@login_required(login_url='login_user')
@csrf_exempt
@require_POST
def crtidnum(request):
    if request.method == 'POST':
        try:
            # Use request.body for JSON data
            data = json.loads(request.body.decode('utf-8'))
            print(data)
           # Access the 'id' key from the JSON data
            id = data.get('domain', '')
            
            crt_data = crtidnumberk.CrtShInfo(id)
            crt_data.get()
            cmrt = crt_data.result()
            crti_Info.objects.create(user=request.user,domain=id, cetiddata=cmrt  ,created_at=datetime.now().date())
            # Return a JSON response
            return HttpResponse(json.dumps({'crt_data':cmrt}), content_type='application/json')

        except json.JSONDecodeError as e:
            return HttpResponse(json.dumps({'error': 'Invalid JSON format'}), content_type='application/json')
    else:
        return HttpResponse(json.dumps({'error': 'Not POST'}), content_type='application/json')

@sync_to_async
@csrf_exempt
@login_required(login_url='login_user')
@async_to_sync
@require_POST
async def vrtotal(request):
    if request.method == 'POST':
        try:
            # Use request.body for JSON data
            data = json.loads(request.body.decode('utf-8'))
           
            # Access the 'domain' key from the JSON data
            domain = data.get('domain', '')
           
            vt = virustotal.vtotal(domain)
            
            dat = await vt.result()
            
            scan = VirusTotalScan(user=request.user,domain=domain, vir_result=dat ,created_at=datetime.now().date())
            await sync_to_async(scan.save)()
            return HttpResponse(json.dumps({'virustotal':dat}), content_type='application/json')

        except json.JSONDecodeError as e:
            return HttpResponse(json.dumps({'error': 'Invalid JSON format'}), content_type='application/json')
    else:
        return HttpResponse(json.dumps({'error': 'Not POST'}), content_type='application/json')




Process_Stack = {}

@login_required(login_url='login_user')
@csrf_exempt
@require_POST
def buildwithscan(request):
    if request.method == 'POST':
        try:
            # Use request.body for JSON data
            data = json.loads(request.body.decode('utf-8'))

            # Access the 'domain' key from the JSON data
            domain = data.get('domain', '')
            res = buildwith(domain)
            buildwith_data = res.json
            buildwithinfo.objects.create(user=request.user,domain=domain, buildwith=buildwith_data,created_at=datetime.now().date() )
            return HttpResponse(json.dumps({'buildwith':res.json}), content_type='application/json')
        except json.JSONDecodeError as e:
            return HttpResponse(json.dumps({'error': 'Invalid JSON format'}), content_type='application/json')

    else:
        return HttpResponse(json.dumps({'error': 'Not POST'}), content_type='application/json')

@login_required(login_url='login_user')
@csrf_exempt
@require_POST
def cmsscan(request):
    if request.method == "POST":
        try:
            # Use request.body for JSON data
            data = json.loads(request.body.decode('utf-8'))

            # Access the 'domain' key from the JSON data
            domain = data.get('domain', '')
            proc = cmsfind(domain)
            proc.start()
            code = proc.code()
            Process_Stack[code] = proc
            while True:
                if proc.result() == False:
                    pass
                else:
                    cmsscaninfo.objects.create(user=request.user,domain=domain, cmss=proc.result()  ,created_at=datetime.now().date() )
                    break
            return HttpResponse(json.dumps({'result':'working','code':code}), content_type='application/json')
        except json.JSONDecodeError as e:
            return HttpResponse(json.dumps({'error': 'Invalid JSON format'}), content_type='application/json')
    else:
        return HttpResponse(json.dumps({'error': 'Not POST'}), content_type='application/json')
            
# @login_required(login_url='login_user')
# @csrf_exempt
# @require_POST
# def dnsview_info(request):
#     if request.method == 'POST':
#         try:
#             # Use request.body for JSON data
#             data = json.loads(request.body.decode('utf-8'))

#             domain = data.get('domain', '')
#             print(domain)
#             scan = data.get('scantype', '')
#             print(scan)

#             scanner=dnsvie(domain,scan)
#             result = scanner.result
#             print(result)
#             dnsviewdata.objects.create(user=request.user,domain=domain, dnsview_result=result ,created_at=datetime.now().date())
#             print(result)
#             # Return a JSON response
#             return HttpResponse(json.dumps({'crt_data':result}), content_type='application/json')

#         except json.JSONDecodeError as e:
#             return HttpResponse(json.dumps({'error': 'Invalid JSON format'}), content_type='application/json')
#     else:
#         return HttpResponse(json.dumps({'error': 'Not POST'}), content_type='application/json')
    

@login_required(login_url='login_user')
@csrf_exempt
@require_POST
def fuzz(request):
    if request.method == "POST":
        try:
            # Use request.body for JSON data
            data = json.loads(request.body.decode('utf-8'))

            # Access the 'domain' key from the JSON data
            domain = data.get('domain', '')
          
            wordlist = '' # add request data for wordlist
            if wordlist == '':
                proc = fuzzer(domain)
            else:
                proc = fuzzer(domain,wordlist)
            proc.start()
            code = proc.code()
            Process_Stack[code] = proc
            while True:
                if proc.result() == False:
                    pass
                else:
                    fuzzerinfo.objects.create(user=request.user,domain=domain, fuzzz=proc.result() ,created_at=datetime.now().date() )
                    break
            return HttpResponse(json.dumps({'result':'working','code':code}), content_type='application/json')
            
        except json.JSONDecodeError as e:
            return HttpResponse(json.dumps({'error': 'Invalid JSON format'}), content_type='application/json')
    else:
        return HttpResponse(json.dumps({'error': 'Not POST'}), content_type='application/json')
                

@login_required(login_url='login_user')
@csrf_exempt
@require_POST
def nmapscan(request):
    if request.method == "POST":
        try:
            # Use request.body for JSON data
            data = json.loads(request.body.decode('utf-8'))

            # Access the 'domain' key from the JSON data
            domain = data.get('domain', '')

            proc = nmap(domain)
            proc.start()
            code = proc.code()
            Process_Stack[code] = proc
            while True:
                if proc.result() == False:
                    pass
                else:
                    nmapinfo.objects.create(user=request.user,domain=domain, nmape=proc.result() ,created_at=datetime.now().date() )
                    break
            return HttpResponse(json.dumps({'result':'working','code':code}), content_type='application/json')

        except json.JSONDecodeError as e:
            return HttpResponse(json.dumps({'error': 'Invalid JSON format'}), content_type='application/json')
    else:
        return HttpResponse(json.dumps({'error': 'Not POST'}), content_type='application/json')
        

@login_required(login_url='login_user')
@csrf_exempt
@require_POST
def wafscan(request):
    if request.method == "POST":
        try:
            # Use request.body for JSON data
            data = json.loads(request.body.decode('utf-8'))

            # Access the 'domain' key from the JSON data
            domain = data.get('domain', '')

            proc = waf(domain)
            proc.start()
            code = proc.code()
            Process_Stack[code] = proc
            while True:
                if proc.result() == False:
                    pass
                else:
                    wafinfo.objects.create(user=request.user,domain=domain, wafee=proc.result() ,created_at=datetime.now().date() )
                    break
            return HttpResponse(json.dumps({'result':'working','code':code}), content_type='application/json')
        except json.JSONDecodeError as e:
            return HttpResponse(json.dumps({'error': 'Invalid JSON format'}), content_type='application/json')
    else:
        return HttpResponse(json.dumps({'error': 'Not POST'}), content_type='application/json')
        
@login_required(login_url='login_user')
@csrf_exempt
@require_POST
def wpscanning(request):
    if request.method == "POST":
        try:
            # Use request.body for JSON data
            data = json.loads(request.body.decode('utf-8'))

            # Access the 'domain' key from the JSON data
            domain = data.get('domain', '')
            print(domain)

            proc = wpscan(domain)
            proc.start()
            code = proc.code()
            Process_Stack[code] = proc
            while True:
                if proc.result() == False:
                    pass
                else:
                    print(proc.result())
                    wpsinfo.objects.create(user=request.user,domain=domain, wpss=proc.result() ,created_at=datetime.now().date() )
                    break
            return HttpResponse(json.dumps({'result':'working','code':code}), content_type='application/json')
        except json.JSONDecodeError as e:
            return HttpResponse(json.dumps({'error': 'Invalid JSON format'}), content_type='application/json')
    else:
        return HttpResponse(json.dumps({'error': 'Not POST'}), content_type='application/json')

@login_required(login_url='login_user')
@csrf_exempt
@require_POST
def pcheck(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode('utf-8'))
            code = data.get('code','')
            if code in Process_Stack:
                return HttpResponse(json.dumps({'result':Process_Stack[code].result()}), content_type='application/json')
            else:
                return HttpResponse(json.dumps({'result':'code not found','error':'true'}), content='application/json')
        except json.JSONDecodeError as e:
            return HttpResponse(json.dumps({'error': 'Invalid JSON format'}), content_type='application/json')

    else:
        return HttpResponse(json.dumps({'error': 'Not POST'}), content_type='application/json')
    
@login_required(login_url='login_user')
@csrf_exempt
@require_POST
def pkill(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode('utf-8'))
            code = data.get('code','')
            if code in Process_Stack:
                Process_Stack[code].kill()
                return HttpResponse(json.dumps({'result':'killed','error':'false'}), content_type='application/json')
            else:
                return HttpResponse(json.dumps({'result':'code not found','error':'true'}), content_type='application/json')
            # return HttpResponse('')
        except json.JSONDecodeError as e:
            return HttpResponse(json.dumps({'error': 'Invalid JSON format'}), content_type='application/json')

    else:
        return HttpResponse(json.dumps({'error': 'Not POST'}), content_type='application/json')
    
@login_required(login_url='login_user')
@csrf_exempt
def search_data(request):
    if request.method == 'POST':
    # if request.method == 'GET' and 'date' in request.GET:
    #     date_str = request.GET.get('date')
        try:
            data = json.loads(request.body.decode('utf-8'))
            print(data)
            date_str = data.get('date', '')
            print(date_str)

            search_date = datetime.strptime(date_str, '%Y-%m-%d').date()
           

            dns_info_list = dnsviewdata.objects.filter(user=request.user, created_at=search_date)
            CRT_Info = CRTInfo.objects.filter(user=request.user, created_at=search_date)
            SSL_Info = SSLInfo.objects.filter(user=request.user, created_at=search_date)
            crtiInfo = crti_Info.objects.filter(user=request.user, created_at=search_date)
            CETIDdata = CETID_data.objects.filter(user=request.user, created_at=search_date)
            whoisdara = whoisInfo.objects.filter(user=request.user, created_at=search_date)
            dnsdumpsterdata = dnsdumpsterInfo.objects.filter(user=request.user, created_at=search_date)
            VirusTotaldata = VirusTotalScan.objects.filter(user=request.user, created_at=search_date)
            buildwithdata = buildwithinfo.objects.filter(user=request.user, created_at=search_date)
            cmsscandata = cmsscaninfo.objects.filter(user=request.user, created_at=search_date)
            wpsdata = wpsinfo.objects.filter(user=request.user, created_at=search_date)
            fuzzerdata = fuzzerinfo.objects.filter(user=request.user, created_at=search_date)
            nmapdata = nmapinfo.objects.filter(user=request.user, created_at=search_date)
            wafdata = wafinfo.objects.filter(user=request.user,created_at=search_date)
            
            
            dns_info = list(dns_info_list.values())
            CRT_data=list(CRT_Info.values())
            SSL_data=list(SSL_Info.values())
            CETI=list(CETIDdata.values())
            crtidata=list(crtiInfo.values())
            whois_data= list(whoisdara.values())
            dnsdumpster_data=list(dnsdumpsterdata.values())
            VirusTotal_data=list(VirusTotaldata.values())
            buildwith_data=list(buildwithdata.values())
            cmsscan_data=list(cmsscandata.values())
            wps_data= list(wpsdata.values())
            fuzzer_data=list(fuzzerdata.values())
            nmap_data=list(nmapdata.values())
            waf_data=list(wafdata.values())
         
          
            
            for item in dns_info:
                item['created_at'] = item['created_at'].isoformat()
            for item in CRT_data:
                item['created_at'] = item['created_at'].isoformat()
            for item in SSL_data:
                item['created_at'] = item['created_at'].isoformat()
            for item in CETI:
                item['created_at'] = item['created_at'].isoformat()
            for item in crtidata:
                item['created_at'] = item['created_at'].isoformat()
            for item in whois_data:
                item['created_at'] = item['created_at'].isoformat()
            for item in dnsdumpster_data:
                item['created_at'] = item['created_at'].isoformat()
            for item in VirusTotal_data:
                item['created_at'] = item['created_at'].isoformat()
            for item in buildwith_data:
                item['created_at'] = item['created_at'].isoformat()
            for item in cmsscan_data:
                item['created_at'] = item['created_at'].isoformat()
            for item in wps_data:
                item['created_at'] = item['created_at'].isoformat()
            for item in fuzzer_data:
                item['created_at'] = item['created_at'].isoformat()
            for item in nmap_data:
                item['created_at'] = item['created_at'].isoformat()
            for item in waf_data:
                item['created_at'] = item['created_at'].isoformat()

            return HttpResponse(json.dumps({'dns_info':dns_info,'CRT_data':CRT_data,'SSL_data':SSL_data,'CETI':CETI,'crtidata':crtidata,'whois_data':whois_data,'dnsdumpster_data':dnsdumpster_data,'VirusTotal_data':VirusTotal_data,'buildwith_data':buildwith_data
             ,'cmsscan_data':cmsscan_data,'wps_data':wps_data,'fuzzer_data':fuzzer_data,'nmap_data':nmap_data,'waf_data':waf_data}), content_type='application/json')
        except ValueError:
            error_message = 'Invalid date format. Please use YYYY-MM-DD.'
            return render(request, 'data_template.html', {'error_message': error_message})
    else:
        return render(request, 'data_template.html')
    
@login_required(login_url='login_user')
def settings(request):
    return render(request, 'settings.html')