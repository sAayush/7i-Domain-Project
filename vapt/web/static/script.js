
var data;

let processapi = '';
let pkillapi = '';

function isthere(list,value){
    for(var i = 0; i < list.length; i++){
        if (list[i] == value){
            return true;
        }
    }
    return false;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function pcheck(code){
    var apiUrl = '/pcheck/';
    console.log('process checking for ' + code);
    try{
        var response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({'code':code}),
            cache: 'default'
        })
        if (!response.ok){
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        var searchResult = await response.json();
        console.log(searchResult);
        return searchResult.result;
    }catch (error) {
        console.error('Error fetching data:', error.message);
        document.querySelector(proc).innerHTML = 'Error fetching data';
    }
}

// Function to initially display the table without any filtering
function fuzzoutput(data) {

    var result = '<h2>Fuzz</h2><br>';
    result += '<table id="fuzz"><thead><tr>';
    result += '<th>Find</th>';
    result += '<th>code</th>';
    result += '<th>Length</th>';
    result += '<th>Character Count</th>';
    result += '<th>Words</th></tr></thead><tbody>';

    var lengthSet = new Set();
    var wordsSet = new Set();

    data.forEach(function (row) {
        var tmp = JSON.parse(row);
        result += `<tr><td>${tmp.find}</td><td>${tmp.code}</td><td>${tmp.length}</td><td>${tmp.total_char}</td><td>${tmp.word}</td></tr>`
        lengthSet.add(tmp.length);
        wordsSet.add(tmp.word);
    });
    result += '</tbody></table>';

    document.querySelector('.fuzz').innerHTML = result;
    
    // Clear previous options for length select
    var lengthSelect = document.getElementById("lengthSelect");
    lengthSelect.innerHTML = ''; // Clear previous options
    lengthSet.forEach(function(length) {
        var option = document.createElement("option");
        option.value = length;
        option.text = length;
        lengthSelect.add(option);
    });

    // Clear previous options for words select
    var wordsSelect = document.getElementById("wordsSelect");
    wordsSelect.innerHTML = ''; // Clear previous options
    wordsSet.forEach(function(words) {
        var option = document.createElement("option");
        option.value = words;
        option.text = words;
        wordsSelect.add(option);
    });

}


function filterfunction() {
    var inputvalus = parseInt(document.getElementById("filterSelect").value);
    var table = document.getElementById("fuzz");
    var tr = table.getElementsByTagName("tr");
    
    for (var i = 0; i < tr.length; i++) {
        var td = tr[i].getElementsByTagName("td")[1]; // Filter applied to the second column
        if (td) {
            var tdval = parseInt(td.innerHTML) || parseInt(td.innerText);
            var rangeStart = Math.floor(inputvalus / 100) * 100; // Calculate the range start
            var rangeEnd = rangeStart + 99; // Calculate the range end

            if (inputvalus >= 200 && inputvalus <= 599) {
                // If the selected value is in the range 200-599
                if (tdval >= rangeStart && tdval <= rangeEnd) {
                    tr[i].style.display = ''; // Show the row
                } else {
                    tr[i].style.display = 'none'; // Hide the row
                }
            } else if (inputvalus === 0) {
                // If the selected value is "none", display all rows
                tr[i].style.display = ''; // Show the row
            } else {
                // For other values, directly compare with the selected value
                if (tdval === inputvalus) {
                    tr[i].style.display = ''; // Show the row
                } else {
                    tr[i].style.display = 'none'; // Hide the row
                }
            }
        }
    }
}


function filterData() {
    var lengthValue = document.getElementById("lengthSelect").value;
    

    var table = document.getElementById("fuzz");
    var tr = table.getElementsByTagName("tr");

    if (lengthValue !== "") {
        for (var i = 0; i < tr.length; i++) {
            var td = tr[i].getElementsByTagName("td")[2]; // Filter applied to the third column
            if (td) {
                var tdval = parseInt(td.innerHTML) || parseInt(td.innerText);
                if (tdval === parseInt(lengthValue)) { // Check for exact match
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
    }
}
function filterDataw(){
    var wordsValue = document.getElementById("wordsSelect").value;

    var table = document.getElementById("fuzz");
    var tr = table.getElementsByTagName("tr");
    if (wordsValue !== "") {
        for (var i = 0; i < tr.length; i++) {
            var td = tr[i].getElementsByTagName("td")[4]; // Filter applied to the fifth column
            if (td) {
                var tdval = parseInt(td.innerHTML) || parseInt(td.innerText);
                if (tdval === parseInt(wordsValue)) { // Check for exact match
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
    }
}
 

async function pkill(code,proc){
    var apiUrl = '/pkill/';
    console.log("Kill Code: " + code);
    console.log("Process: " + proc);
    try{
        var response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({'code': code}),
            cache: 'default'
        })
        console.log('Kill done');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response
        var searchResult = await response.json();
        //data = searchResult;
        // console.log(data);
        let output = await pcheck(code);
        data = output;
        console.log("pkill");
        // console.log(data);
        document.querySelector(proc).innerHTML = `Process is Killed`;
    }catch (error) {
        console.error('Error fetching data:', error.message);
        document.querySelector(proc).innerHTML = 'Error fetching data';
    }
}

async function fuzz(){
    var domain = document.querySelector('#domain').value;
 
    body = JSON.stringify({'domain':domain});
    var apiUrl = '/fuzz/';
    console.log(apiUrl)
    try{
        var response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({'domain': domain}),
            cache: 'default'
        })
        console.log('ffuf done');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response
        var searchResult = await response.json();
        //data = searchResult;
        let code = searchResult.code;
        
        document.querySelector('.fuzz').innerHTML = `Scanning... <button onclick="pkill(${code},'.fuzz')">Kill</button>`;
        var check = false;
        while (!check){
            await sleep(5000);
            check = await pcheck(code);
            console.log("Fuzz Checking");
        }
        data = check;
        
        fuzzoutput(data);
    }catch (error) {
        console.error('Error fetching data:', error.message);
        document.querySelector('.fuzz').innerHTML = 'Error fetching data';
    }
}

async function nmap(){
    var domain = document.querySelector('#domain').value;
    body = JSON.stringify({'domain':domain});
    var apiUrl = '/nmap/';
    try{
        var response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({'domain': domain}),
            cache: 'default'
        })
        console.log('nmap done');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response
        var searchResult = await response.json();
        //data = searchResult;
        let code = searchResult.code;
        
        document.querySelector('.nmap').innerHTML = `Scanning... <button onclick="pkill(${code},'.nmap')">Kill</button>`;
        var check = false;
        while (!check){
            await sleep(5000);
            check = await pcheck(code);
            console.log("nmap Checking");
        }
        data = check;
        // jsondata = "<pre>";
        // data.forEach(function (port){
        //     jsondata += JSON.stringify(port,undefined,2)
        // });
        // jsondata += "</pre>"
        document.querySelector('.nmap').innerHTML = '<h1>Nmap:</h1><br><pre>' + check + '</pre>'
    }catch (error) {
        console.error('Error fetching data:', error.message);
        document.querySelector('.nmap').innerHTML = 'Error fetching data';
    }
}

async function wafscan(){
    var domain = document.querySelector('#domain').value;
    body = JSON.stringify({'domain':domain});
    var apiUrl = '/waf/';
    try{
        var response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({'domain': domain}),
            cache: 'default'
        })
        console.log('waf done');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response
        var searchResult = await response.json();
        //data = searchResult;
        let code = searchResult.code;
        document.querySelector('.waf').innerHTML = `Scanning... <button onclick="pkill(${code},'.waf')">Kill</button>`;
        var check = false;
        while (!check){
            await sleep(5000);
            check = await pcheck(code);
            console.log("waf Checking");
        }
        data = check;
        result = JSON.parse(check).WAF;
        document.querySelector('.waf').innerHTML = "<br><b>WAF Scan</b>: " + result;
    }catch (error) {
        console.error('Error fetching data:', error.message);
        document.querySelector('.waf').innerHTML = 'Error fetching data';
    }
}

async function cmsscan(){
    var domain = document.querySelector('#domain').value;
    body = JSON.stringify({'domain':domain});
    var apiUrl = '/cmsscan/';
    console.log(apiUrl)
    try{
        var response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({'domain': domain}),
            cache: 'default'
        })
        console.log('cms done');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response
        var searchResult = await response.json();
        //data = searchResult;
        let code = searchResult.code;
       
        document.querySelector('.cms').innerHTML = `Scanning... <button onclick="pkill(${code},'.cms')">Kill</button>`;
        var check = false;
        while (!check){
            await sleep(5000);
            check = await pcheck(code);
            console.log("cms Checking");
        }
        data = check;
        result = JSON.parse(data).CMS;
        document.querySelector('.cms').innerHTML = "<br><b>CMS Scan</b>: " + JSON.parse(check).CMS;
        if (result == "WordPress"){
            console.log("wpscan")
            wpscan();
        }else{
            JSON.parse(check).WAF == 'WordPress';
            console.log("no");
        }
    }catch (error) {
        console.error('Error fetching data:', error.message);
        document.querySelector('.cms').innerHTML = 'Error fetching data';
    }
}

function wpsscan(data) {
    const wpscanDataDiv = document.createElement('div'); // Define wpscanDataDiv here

    const interestingFindings = data.interesting_findings;
    wpscanDataDiv.innerHTML += '<h2>Interesting Findings</h2><ul>';
    interestingFindings.forEach(finding => { 
      wpscanDataDiv.innerHTML += `
        <li>
          <strong>Type:</strong> ${finding.to_s} <br>
          <strong>Interesting Entries:</strong>
          <ul>
            ${finding.interesting_entries.map(entry => `<li>${entry}</li>`).join('')}
          </ul>
        </li>
      `;
    });
    wpscanDataDiv.innerHTML += '</ul>';

    // Display main theme information if available
    if (data.main_theme && data.main_theme !== null) {
        const mainTheme = data.main_theme;
        wpscanDataDiv.innerHTML += `
        <h2>Main Theme</h2>
        <ul>
          <li><strong>Slug:</strong> ${mainTheme.slug}</li>
          <li><strong>Location:</strong> <a href="${mainTheme.location}">${mainTheme.location}</a></li>
          <li><strong>Style Name:</strong> ${mainTheme.style_name}</li>
          <li><strong>Style URI:</strong> ${mainTheme["Style URI"]}</li>
          <li><strong>Description:</strong> ${mainTheme.description}</li>
          <li><strong>Author:</strong> ${mainTheme.author}</li>
          <li><strong>Author URI:</strong> <a href="${mainTheme.author_uri}">${mainTheme.author_uri}</a></li>
          <li><strong>License:</strong> ${mainTheme["Found By"]}</li>
          <!-- Include other main theme details here -->
        </ul>
      `;
    } else {
        wpscanDataDiv.innerHTML += '<p>No Main Themes Found.</p>';  
    }

    // Display version information if available
    if (data.main_theme.version && data.main_theme.version !== null) {
        const version = data.main_theme.version;
        wpscanDataDiv.innerHTML += `
        <h2>Version</h2>
        <ul>
          <li><strong>Number:</strong> ${version.number}</li>
          <li><strong>Found By:</strong> ${version.found_by}</li>
          <li><strong>Interesting Entries:</strong> ${version.interesting_entries.join(', ')}</li>
        </ul>
      `;
    } else {
        wpscanDataDiv.innerHTML += '<p>No Version Found.</p>'; 
    }

    // Display users
    const users = data.users;
    wpscanDataDiv.innerHTML += '<h2>Users</h2><ul>';
    Object.keys(users).forEach(user => {
        wpscanDataDiv.innerHTML += `
        <li>
          <strong>${user}</strong> <br>
          <strong>Found By:</strong> ${users[user].found_by}
        </li>
      `;
    });
    wpscanDataDiv.innerHTML += '</ul>';

    // Display vulnerability API error if available
    if (data.vuln_api && data.vuln_api.error) {
        wpscanDataDiv.innerHTML += `<p><strong>Vulnerability API Error:</strong> ${data.vuln_api.error}</p>`;
    }

    // Display additional information
    const additionalInfo = {
      "Start Time": data.start_time,
      "Target URL": `<a href="${data.target_url}">${data.target_url}</a>`
      // Include other relevant data here
    };
    wpscanDataDiv.innerHTML += '<h2>Additional Information</h2><ul>';
    Object.keys(additionalInfo).forEach(key => {
      wpscanDataDiv.innerHTML += `<li><strong>${key}:</strong> ${additionalInfo[key]}</li>`;
    });
    wpscanDataDiv.innerHTML += '</ul>';

    document.querySelector('.wpscan').appendChild(wpscanDataDiv); // Append wpscanDataDiv to .wpscan
}


async function wpscan(){
    var domain = document.querySelector('#domain').value;
    
    body = JSON.stringify({'domain':domain});
    var apiUrl = '/wpscanning/';
    console.log(apiUrl)
    try{
        var response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({'domain': domain}),
            cache: 'default'
        })
        console.log('wpscan done');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response
        var searchResult = await response.json();
       
        //data = searchResult;
        let code = searchResult.code;
        var check = false;
        while (!check){
            await sleep(5000);
            check = await pcheck(code);
            console.log("wpscan Checking");
        }
        data = check;
        wpsscan(data)

     
       
     
    } catch (error) {
    console.error('Error fetching data:', error.message);
    }
}
async function buldwith(){
    var buildwithDiv = document.getElementById("buildwith");
    var domain = document.querySelector('#domain').value;
    body = JSON.stringify({'domain':domain});
    var apiUrl = '/buildwith/';
    console.log(apiUrl)
    try {
        var response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({'domain': domain}),
            cache: 'default'
        });
        
        // console.log('buildwith done');

        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response
        var searchResult = await response.json();

        var table = document.createElement('table');
        var header = table.createTHead();
        var row = header.insertRow(0);

        // Extract column names from the first row of data
        var columns = Object.keys(searchResult.buildwith[0]);

        // Create table header
        var thead = table.createTHead();
        var row = thead.insertRow();
        columns.forEach(function(column) {
            var th = document.createElement('th');
            th.textContent = column;
            row.appendChild(th);
        });

        // Populate table with data
        var tbody = table.createTBody();
        searchResult.buildwith.forEach(function(rowData) {
            var tr = document.createElement('tr');
            columns.forEach(function(column) {
                var td = document.createElement('td');
                td.textContent = rowData[column];
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        // Create and append heading
        var heading = document.createElement('h1');
        heading.textContent = 'Technical Lookup';

        var buildwithDiv = document.querySelector('.buildwith');
        buildwithDiv.innerHTML = '';
        buildwithDiv.appendChild(heading);
        buildwithDiv.appendChild(table);
    }
    catch (error) {
        console.error('Error fetching data:', error.message);
        document.querySelector('.whois').textContent = 'Error fetching data';
    }
}

async function whois(){
	var domain = document.querySelector('#domain').value;
    body = JSON.stringify({'domain':domain});
    var apiUrl = '/whois/';
    console.log(apiUrl);
	try {
            // Make a fetch request
            var response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({'domain': domain}),
                cache: 'default'
            });
            
            // console.log('WhoIs done');

            // Check if the request was successful
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Parse the JSON response
            var searchResult = await response.json();
            // //data = searchResult;
            
            // Display the JSON result in the specified div

            var jsondata = JSON.parse(searchResult['whois']);
            // console.log(jsondata);
            var whois = "<h2>WhoIs</h2>";
            whois += '<table>';
            whois += `<tr><td>Domain</td><td>${jsondata['domain_name']}</td></tr>`;
            whois += `<tr><td>Created On</td><td>${jsondata['creation_date']}</td></tr>`;
            whois += `<tr><td>Expiring On</td><td>${jsondata['expiration_date']}</td></tr>`;
            whois += `<tr><td>Registered On</td><td>${jsondata['registrar']}</td></tr>`;
            whois += '</table>';
            document.querySelector('.whois').innerHTML = whois;
            
     	}
    catch (error) {
        console.error('Error fetching data:', error.message);
        document.querySelector('.whois').textContent = 'Error fetching data';
    }
}

async function dnsdump(){
	var domain = document.querySelector('#domain').value;
    body = JSON.stringify({'domain':domain});
    var apiUrl = '/dnsdump/';
    console.log(apiUrl)
	try {
            // Make a fetch request
            var response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({'domain': domain}),
                cache: 'default'
            });
            // console.log('DNSDUMP done');

            // Check if the request was successful
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Parse the JSON response
            var searchResult = await response.json();
          

            //seprating the data
            var dns = JSON.parse(searchResult.dnsdumpster)['dns'];
            var host = JSON.parse(searchResult.dnsdumpster)['host'];
            var txt = JSON.parse(searchResult.dnsdumpster)['txt'];
            var mx = JSON.parse(searchResult.dnsdumpster)['mx'];

           // setting up the dns data
            var table_dns = "<h2>DNS</h2>";
            table_dns += "<table>";
            table_dns += "<th>NameServer</th>";
            table_dns += "<th>IP</th>";
            table_dns += "<th>Domain</th>";
            JSON.parse(dns).DNS.forEach(function (dnsdata){
            	table_dns += `<tr><td>${dnsdata.dns}</td><td>${dnsdata.ip}</td><td>${dnsdata.domain}</td></tr>`;
            });
            table_dns += "</table>";

            // setting up the txt data
            var table_txt = "<br><h2>TXT</h2>";
            table_txt += '<table>'
            JSON.parse(txt).TXT.forEach(function (txtdata){
            	table_txt += `<tr><td>${txtdata}</td></tr>`;
            });
            table_txt += '</table>'

            //setting up the mx data
            var table_mx = "<br><h2>MX</h2>"
            table_mx += '<table>';
            table_mx += '<th>MXServer</th>'
            table_mx += '<th>IP</th>'
            table_mx += '<th>domain</th>'
            JSON.parse(mx).MX.forEach(function (mxdata){
            	table_mx += `<tr><td>${mxdata.dns}</td><td>${mxdata.ip}</td><td>${mxdata.domain}</td></tr>`;
            });
            table_mx += '</table>';

            //setting up the Subdomain data
            var table_host = '<br><h2>SUB Domains</h2>';
            table_host += '<table>';
            table_host += '<th>Domains</th>';
            table_host += '<th>IP</th>';
            table_host += '<th>Hosted</th>';
            JSON.parse(host).SUBDomain.forEach(function (hostdata){
            	table_host += `<tr><td>${hostdata.domains}</td><td>${hostdata.ip}</td><td>${hostdata.hosted}</td></tr>`
            });
            table_host += '</table>';
            document.querySelector('.dnsdump').innerHTML = table_dns + table_mx + table_txt + table_host;

            // document.querySelector('.dnsdump').innerHTML = "working";
     	}
    catch (error) {
        console.error('Error fetching data:', error.message);
        document.querySelector('.dnsdump').textContent = 'Error fetching data';
    }
}

async function crt_info() {
    var domain = document.querySelector('#domain').value;
    var crtDataDiv = document.getElementById("crt_data_div_0");
    body = JSON.stringify({ 'domain': domain });
    var apiUrl = '/crt_info/';
    console.log(apiUrl);

    try {
        // Make a fetch request
        var response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'domain': domain }),
            cache: 'default'
        });

        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response
        var searchResult = await response.json();
        // console.log(searchResult);

        // // Extracting data
        var crtInfo = JSON.parse(searchResult.crt_data);
        // console.log(crtInfo); // Log crtInfo to inspect the structure

        crt_data_div_0.innerHTML = '';


        // // Create HTML table
        var table = document.createElement('table');
        var header = table.createTHead();
        var row = header.insertRow(0);
        var columns = ['ID', 'Logged At', 'Not Before', 'Not After', 'Common Name', 'MatchingIdentities', 'Issuer Name'];
        columns.forEach(function(column) {
            var th = document.createElement('th');
            th.textContent = column;
            row.appendChild(th);
        });
        // console.log(crtInfo);
        // Populate table with data
        var tbody = table.createTBody();
        crtInfo.forEach(function(info) {
            row = tbody.insertRow();

            let cell = row.insertCell()
            cell.textContent = info.ID.id;
            cell.onclick = function() {
                crtidnum(info.ID.id);
            }


            row.insertCell().textContent = info.loggedAt;
            row.insertCell().textContent = info.NotBefore;
            row.insertCell().textContent = info.NotAfter;
            row.insertCell().textContent = info.CommonName;
            row.insertCell().textContent = info.MatchingIdentities.join(', ');
            let cel = row.insertCell();
            cel.textContent = info.IssuerName.name;
            

            // Add click event listener to the cell
            cel.addEventListener("click", function() {
                console.log("Cell clicked");
                let hrefValue = info.IssuerName.href.split("=")[1];
                
                // Call CrtShIn function with the extracted parameter
                CrtShIn(hrefValue);

            });
        });
        crtDataDiv.appendChild(table);

    } catch (error) {
        console.error('Error fetching data:', error.message);
        // Display error message on the HTML page
        document.querySelector('.crt_data').textContent = 'Error fetching data: ' + error.message;
    }
}

async function ssl_info() {
    var domain = document.querySelector('#domain').value;
    var ReportDataDiv = document.getElementById("ReportDataDiv");
    var issuediv = document.getElementById("issuediv");
    var opensslhandshakediv = document.getElementById("opensslhandshakediv");
    var General_InformationDiv = document.getElementById("General_InformationDiv");
    var DNSDiv = document.getElementById("DNSDiv");
    var CertificateDIV = document.getElementById("CertificateDIV");

    body = JSON.stringify({ 'domain': domain });
    var apiUrl = '/ssl_info/';
    console.log(apiUrl);
    try {
        // Make a fetch request
        var response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'domain': domain }),
            cache: 'default'
        });

        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        var searchResult = await response.json();

        var crtInfo = JSON.parse(searchResult.crt_data)[0];
        

        for (const [key, value] of Object.entries(crtInfo.Certificates)) {
            var p = document.createElement('p');
            var table = document.createElement('table');
            var header = table.createTHead();
            var row = header.insertRow(0);
            var columns = ['Icon', 'Key', 'Value'];
            p.innerHTML = key
            columns.forEach(function(column) {
                var th = document.createElement('th');
                th.textContent = column;
                row.appendChild(th);
            });
            // Populate table with data
            var tbody = table.createTBody();
            value.forEach(function(info) {
                row = tbody.insertRow();
                row.insertCell().textContent = info["Icon"];
                row.insertCell().textContent = info["Key"];
                row.insertCell().textContent = info["Value"];
            });
            CertificateDIV.appendChild(p);
            CertificateDIV.appendChild(table);

        }

        var table = document.createElement('table');
        var header = table.createTHead();
        var row = header.insertRow(0);
        var columns = ['Icon', 'Key', 'Value'];
        columns.forEach(function(column) {
            var th = document.createElement('th');
            th.textContent = column;
            row.appendChild(th);
        });
        // Populate table with data
        var tbody = table.createTBody();
        crtInfo.DNS.forEach(function(info) {
            row = tbody.insertRow();
            row.insertCell().textContent = info["Icon"];
            row.insertCell().textContent = info["Key"];
            row.insertCell().textContent = info["Value"];
        });
        DNSDiv.appendChild(table);




        var table = document.createElement('table');
        var header = table.createTHead();
        var row = header.insertRow(0);
        var columns = ['Icon', 'Key', 'Value'];
        columns.forEach(function(column) {
            var th = document.createElement('th');
            th.textContent = column;
            row.appendChild(th);
        });
        // Populate table with data
        var tbody = table.createTBody();
        crtInfo.Report.forEach(function(info) {
            row = tbody.insertRow();
            row.insertCell().textContent = info["Icon"];
            row.insertCell().textContent = info["Key"];
            row.insertCell().textContent = info["Value"];
        });
        ReportDataDiv.appendChild(table);


        var table = document.createElement('table');
        var header = table.createTHead();
        var row = header.insertRow(0);
        var columns = ['Icon', 'Key', 'Value'];
        columns.forEach(function(column) {
            var th = document.createElement('th');
            th.textContent = column;
            row.appendChild(th);
        });
        // Populate table with data
        var tbody = table.createTBody();
        crtInfo.General_Information.forEach(function(info) {
            row = tbody.insertRow();
            row.insertCell().textContent = info["Icon"];
            row.insertCell().textContent = info["Key"];
            row.insertCell().textContent = info["Value"];
        });
        General_InformationDiv.appendChild(table);

        var issue = crtInfo.issue;
        issuediv.innerHTML = `
              <h1>CA ID: ${issue}</h1>
          `;

        var OpenSSL_Handshake = crtInfo.OpenSSL_Handshake.OpenSSL_Handshake;
        opensslhandshakediv.innerHTML = `<pre> OpenSSL_Handshake:${OpenSSL_Handshake}</pre>`;


        // // Extracting data
        var crtInfo = JSON.parse(searchResult.crt_data);
       

    } catch (error) {
        console.error('Error fetching data:', error.message);
        // Display error message on the HTML page
        opensslhandshakediv.innerHTML = `
             <h1>Error fetching data</h1>
             <pre>${error.message}</pre>
         `;
    }
}

async function CrtShIn(ide) {
    let domain = ide
    var modal = document.getElementById("myModal");
    var span = document.getElementsByClassName("close")[0];
    var crtDataDiv = document.getElementById("crt_data_div");
    var CertificatesDiv = document.getElementById("certificates_div");
    var Issued_CertificatesDIV = document.getElementById("Issued_Certificates_DIV");
    var container = document.getElementById("container_div");
    body = JSON.stringify({ 'domain': domain });
    var apiUrl = '/cetid/';
    console.log(apiUrl);
    span.onclick = function() {
        modal.style.display = "none";
    }
    try {
        // Make a fetch request
        var response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'domain': domain }),
            cache: 'default'
        });

        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response
        var searchResult = await response.json();
        crt_data_div.innerHTML = '';
        certificates_div.innerHTML = '';
        Issued_Certificates_DIV.innerHTML = '';
        container_div.innerHTML = '';
        

        var crtInfo = JSON.parse(searchResult.crt_data);
        // console.log(crtInfo); // Log crtInfo to inspect the structure
      
        if (crtInfo.Trust && crtInfo.Trust.length > 0) {
            var table = document.createElement('table');
            var header = table.createTHead();
            var row = header.insertRow(0);

            // Create table header cells
            crtInfo.Trust[0].forEach(function(column) {
                var th = document.createElement('th');
                th.textContent = column.replace('_', ' '); // Replace underscores with spaces
                row.appendChild(th);
            });

            // Populate table with data
            var tbody = table.createTBody();
            crtInfo.Trust.slice(1).forEach(function(rowData) {
                var row = tbody.insertRow();
                rowData.forEach(function(cellData) {
                    var cell = row.insertCell();
                    cell.textContent = cellData;
                });
            });

            // Append the table to the HTML element where you want to display it
            // For example:
            container.appendChild(table);
        } else {
            console.log('No Trust data found.');
        }


        var table = document.createElement('table');
        var header = table.createTHead();
        var row = header.insertRow(0);
        var columns = ['issuer_Name', 'crt sh ID', 'Not Before', 'Not After'];
        columns.forEach(function(column) {
            var th = document.createElement('th');
            th.textContent = column;
            row.appendChild(th);
        });
        // console.log(crtInfo);
        // Populate table with data
        var tbody = table.createTBody();
        crtInfo.Certificates.forEach(function(info) {
            row = tbody.insertRow();
            row.insertCell().textContent = info['issuer_Name'].Name;
            row.insertCell().textContent = info['crt.sh ID'].id;
            row.insertCell().textContent = info['Not_Before'];
            row.insertCell().textContent = info['Not_After'];

        });
        CertificatesDiv.appendChild(table);

        var table = document.createElement('table');
        var header = table.createTHead();
        var row = header.insertRow(0);
        var columns = ['Unexpired', 'TOTAL', 'Population', 'Expired'];
        columns.forEach(function(column) {
            var th = document.createElement('th');
            th.textContent = column;
            row.appendChild(th);
        });
        // console.log(crtInfo);
        // Populate table with data
        var tbody = table.createTBody();
        crtInfo.Issued_Certificates.forEach(function(info) {
            row = tbody.insertRow();
            row.insertCell().textContent = info.Unexpired;
            row.insertCell().textContent = info['TOTAL'];
            row.insertCell().textContent = info.Population;
            row.insertCell().textContent = info.Expired;

        });
        Issued_CertificatesDIV.appendChild(table);
        // // Extracting data
        var crtInfo = JSON.parse(searchResult.crt_data);
       

        crtDataDiv.innerHTML = '';
        // // Extract the required information from the crtInfo object
        var caId = crtInfo.crt_sh_CA_ID;
        var textContent = crtInfo.Text_Content.join('<br/>');

        // Display the extracted information in the HTML page
        crtDataDiv.innerHTML = `
             <h1>CA ID: ${caId}</h1>
             <br>${textContent}</br>
         `;

        modal.style.display = "block";
    } catch (error) {
        console.error('Error fetching data:', error.message);
        // Display error message on the HTML page
        crtDataDiv.innerHTML = `
             <h1>Error fetching data</h1>
             <pre>${error.message}</pre>
         `;
    }
}

async function crtidnum(id) {
    // var domain = document.querySelector('#domain').value;
    let domain = id
    var modal = document.getElementById("myModal");
    var span = document.getElementsByClassName("close")[0];
    var crtDataDiv = document.getElementById("crt_data_div_1");
    var TransparencyDataDiv = document.getElementById("TransparencyDataDiv");
    var FingerprintsDataDiv = document.getElementById("FingerprintsDataDiv");
    var CertificateDiv = document.getElementById("CertificateDiv");
    body = JSON.stringify({ 'domain': domain });
    var apiUrl = '/crtidnum/';
    console.log(apiUrl);
    span.onclick = function() {
        modal.style.display = "none";
    }
    try {
        // Make a fetch request
        var response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'domain': domain }),
            cache: 'default'
        });

        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response
        var searchResult = await response.json();

        var crtInfo = JSON.parse(searchResult.crt_data);
 

        crt_data_div_1.innerHTML='';
        CertificateDiv.innerHTML = '';
        crtDataDiv.innerHTML = '';
        TransparencyDataDiv.innerHTML = '';
        FingerprintsDataDiv.innerHTML = '';


        var preTag = document.createElement('pre');
        crtInfo.Certificate.forEach(function(info) {
            preTag.textContent += info ; 
        });

        CertificateDiv.appendChild(preTag);
        


        var table = document.createElement('table');
        var header = table.createTHead();
        var row = header.insertRow(0);
        var columns = ['Entry #', 'Log Operator', 'Log URL', 'Timestamp'];
        columns.forEach(function(column) {
            var th = document.createElement('th');
            th.textContent = column;
            row.appendChild(th);
        });
        // console.log(crtInfo);
        // Populate table with data
        var tbody = table.createTBody();
        crtInfo["Certificate Transparency"].forEach(function(info) {
            row = tbody.insertRow();
            row.insertCell().textContent = info["Entry #"];
            row.insertCell().textContent = info["Log Operator"];
            row.insertCell().textContent = info["Log URL"];
            row.insertCell().textContent = info["Timestamp"];

        });

        TransparencyDataDiv.appendChild(table);

        var table = document.createElement('table');
        var header = table.createTHead();
        var row = header.insertRow(0);
        var columns = ['href', 'sha_256'];
        columns.forEach(function(column) {
            var th = document.createElement('th');
            th.textContent = column;
            row.appendChild(th);
        });
        // console.log(crtInfo);
        // Populate table with data
        var tbody = table.createTBody();
        crtInfo["Certificate Fingerprints"].forEach(function(info) {
            row = tbody.insertRow();
            row.insertCell().textContent = info["SHA_256"].href;
            row.insertCell().textContent = info["SHA_256"].sha_256;
        });

        FingerprintsDataDiv.appendChild(table);

        var table = document.createElement('table');
        var header = table.createTHead();
        var row = header.insertRow(0);
        var columns = ['Status', 'Revocation Date', 'Provider', 'Mechanism ', 'Last Observed in CRL', 'Last Checked'];
        columns.forEach(function(column) {
            var th = document.createElement('th');
            th.textContent = column;
            row.appendChild(th);
        });
        // console.log(crtInfo);
        // Populate table with data
        var tbody = table.createTBody();
        crtInfo.Revocation.forEach(function(info) {
            row = tbody.insertRow();
            row.insertCell().textContent = info["Status"];
            row.insertCell().textContent = info["Revocation Date"];
            row.insertCell().textContent = info["Provider"];
            row.insertCell().textContent = info["Mechanism"];
            row.insertCell().textContent = info["Last Observed in CRL"];
            row.insertCell().textContent = info["Last Checked"];

        });

        crtDataDiv.appendChild(table);

        var caId = crtInfo.crt_sh_ID.ID;
        var summary = crtInfo.crt_sh_ID.summary;
        crtDataDiv.innerHTML = `
            <h1>CA ID: ${caId}</h1>
            <p>summary: ${summary}</p>
        `;

        modal.style.display = "block";

    } catch (error) {
        console.error('Error fetching ', error.message);
        // Display error message on the HTML page
        crtDataDiv.innerHTML = `
            <h1>Error fetching data</h1>
            <pre>${error.message}</pre>
        `;

        modal.style.display = "block";
    }
}

async function vtotal(){
    var domain = document.querySelector('#domain').value;
    var apiUrl = '/vrtotal/';
    console.log(apiUrl);
    try {
            // Make a fetch request
            var response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({'domain': domain}),
                cache: 'default'
            });
            // console.log('vtotal done');

            // Check if the request was successful
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Parse the JSON response
            var searchResult = await response.json();
        
            if (searchResult['virustotal'].length != 0){
                var keys = Object.keys(searchResult['virustotal'][0].attributes);
                //scan result
                var attributes = searchResult['virustotal'][0].attributes
                table_scan = attributes.last_analysis_results;
                scan_engine = Object.keys(table_scan);
                var table_scan_result = "<br><h1>Virus Total</h1>";
                table_scan_result += "<h3>Scan Result</h3>";
                table_scan_result += `<p><b>Last Scan:</b> ${new Date( attributes.last_analysis_date * 1000)}</p>`;
                table_scan_result += "<table>";
                table_scan_result += "<th>Engine</th><th>Category</th><th>Result</th><th>Method</th>"
                scan_engine.forEach(function (engine){
                    table_scan_result += `<tr><td>${engine}</td><td>${table_scan[engine].category}</td><td>${table_scan[engine].result}</td><td>${table_scan[engine].method}</td></tr>`;
                });

                table_scan_result += "</table>";
                table_scan_result += "<h3>Analysis Status</h3>";
                table_scan_result += "<table>";
                table_scan_result += `<tr><td><b>Harmless</b></td><td>${attributes.last_analysis_stats.harmless}</td></tr>`;
                table_scan_result += `<tr><td><b>Malicious</b></td><td>${attributes.last_analysis_stats.malicious}</td></tr>`;
                table_scan_result += `<tr><td><b>Suspicious</b></td><td>${attributes.last_analysis_stats.suspicious}</td></tr>`;
                table_scan_result += `<tr><td><b>Timeout</b></td><td>${attributes.last_analysis_stats.timeout}</td></tr>`;
                table_scan_result += `<tr><td><b>Undetected</b></td><td>${attributes.last_analysis_stats.undetected}</td></tr>`;
                table_scan_result += "</table>";
                console.log("Scan Result");

                //Request and Response
                response_data = attributes.last_http_response_headers;
                if (response_data){
                    var table_res = "<h3>Response Analysis</h3>";
                    table_res += `<p><b>URL:</b> ${attributes.last_final_url}</p>`;
                    table_res += `<p><b>Response Code:</b> ${attributes.last_http_response_code}</p>`;
                    table_res += `<p><b>Response Length:</b> ${attributes.last_http_response_content_length}</p>`;
                    table_res += `<p><b>Last Modification Date:</b> ${new Date(attributes.last_modification_date * 1000)}</p>`;
                    table_res += `<p><b>Last Submission Date:</b> ${new Date(attributes.last_submission_date * 1000)}</p>`;
                    var res_keys = Object.keys(attributes.last_http_response_headers);
                    table_res += "<table>";
                    table_res += "<th>Header</th><th>Value</th>";
                    res_keys.forEach(function(header){
                        table_res += `<tr><td>${header}</td><td>${response_data[header]}</td></tr>`;
                    });
                    table_res += "</table>";
                    // console.log("Response Result");
                }

                //other data
                var otherdata = '';
                if (isthere(keys,"outgoing_links")){

                    otherdata += '<br><table>';
                    otherdata += '<th>OutGoing Links</th>';
                    attributes.outgoing_links.forEach(function(od){
                        otherdata += `<tr><td>${od}</td></tr>`;
                    });
                    otherdata += '</table>';
                    // console.log("outgoing_links");
                }

                otherdata += '<br><table>';
                otherdata += '<th>Redirection Chain</th>';
                attributes.redirection_chain.forEach(function(rc){
                    otherdata += `<tr><td>${rc}</td></tr>`;
                });
                otherdata += '</table>';
                // console.log("redirection_chain");

                otherdata += `<br><p><b>Reputation:</b> ${attributes.reputation}</p>`;


                otherdata += '<br><h3>Site Category</h3><table>';
                otherdata += '<th>Engine</th><th>Result</th>';
                var cat_key = Object.keys(attributes.categories);
                cat_key.forEach(function(c){
                    otherdata += `<tr><td>${c}</td><td>${attributes.categories[c]}</td></tr>`;
                });
                otherdata += '</table>';
                // console.log("categories");
                if (attributes.html_meta){
                    otherdata += '<br><h3>HTML Meta</h3><table>';
                    otherdata += '<th>Meta</th><th>Value</th>';
                    var meta_key = Object.keys(attributes.html_meta);
                    meta_key.forEach(function(c){
                        otherdata += `<tr><td>${c}</td><td>${attributes.html_meta[c]}</td></tr>`;
                    });
                    otherdata += '</table>';
                    console.log("meta");
                }

                document.querySelector('.vtotal').innerHTML = table_scan_result + table_res + otherdata;
            }else{
                document.querySelector('.vtotal').innerHTML = "<br><h1>Virus Total</h1><h3>No Data On it</h3>";
            }
            // document.querySelector('.vtotal').innerHTML = "Working";
        }
    catch (error) {
        console.error('Error fetching data:', error.message);
        document.querySelector('.vtotal').textContent = 'Error fetching data';
    }
}

// async function dnsview_info() {
//     var domain = document.querySelector('#domain').value;
//     var scantype = document.getElementById("scantype").value;
//     console.log(domain, scantype);
    
//     try {
//         var apiUrl = '/dnsview_info/'; // URL of the Django view
//         console.log(apiUrl)
//         var requestBody = JSON.stringify({ 'domain': domain, 'scantype': scantype });

//         // Make a fetch request
//         var response = await fetch(apiUrl, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: requestBody,
//             cache: 'no-cache'
//         });

//         // Check if the request was successful
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }

//         // Parse the JSON response
//         var responseData = await response.json();
//         var crtData = responseData.crt_data;
       

//         var table = document.createElement('table');

//         // Create header row for query object
//         var queryHeaderRow = table.insertRow();
//         var queryHeaderCell = document.createElement('th');
//         queryHeaderCell.textContent = 'Query';
//         queryHeaderCell.colSpan = 2; // Span two columns
//         queryHeaderRow.appendChild(queryHeaderCell);


//         // Create data rows for query object
//         Object.entries(crtData.query).forEach(([key, value]) => {
//             var row = table.insertRow();
//             var keyCell = row.insertCell();
//             keyCell.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize first letter
//             var valueCell = row.insertCell();
//             valueCell.textContent = value;
//         });




//         if (crtData.expectedresponse) {
//             var expectedResponseHeaderRow = table.insertRow();
//             var expectedResponseHeaderCell = document.createElement('th');
//             expectedResponseHeaderCell.textContent = 'Expected Response';
//             expectedResponseHeaderCell.colSpan = 2; // Span two columns
//             expectedResponseHeaderRow.appendChild(expectedResponseHeaderCell);
//             // Create data row for expected response
//             var expectedResponseRow = table.insertRow();
//             var expectedResponseCell = document.createElement('td');
//             expectedResponseCell.textContent = crtData['expectedresponse'];
//             expectedResponseCell.colSpan = 2; // Span two columns
//             expectedResponseRow.appendChild(expectedResponseCell)
//             if (crtData.response.server) {
//                 var headerRow = table.insertRow();
//                 Object.keys(crtData.response.server[0]).forEach(key => {
//                     var headerCell = document.createElement('th');
//                     headerCell.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize first letter
//                     headerRow.appendChild(headerCell);
//                 });

//                 // Add data rows
//                 crtData.response.server.forEach(server => {
//                     var row = table.insertRow();
//                     Object.values(server).forEach(value => {
//                         var cell = row.insertCell();
//                         cell.textContent = value;
//                     });
//                 });
//             }

//         }

//         if (crtData.response.records) {
//             var headerRow = table.insertRow();
//             // Add data rows
//             crtData.response.records.forEach((server, index) => {
//                 if (index == 0) {
//                     Object.keys(server).forEach(key => {
//                         var headerCell = document.createElement('th');
//                         headerCell.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize first letter
//                         headerRow.appendChild(headerCell);
//                     });
//                 }
//                 var row = table.insertRow();
//                 Object.values(server).forEach(value => {
//                     var cell = row.insertCell();
//                     cell.textContent = value;
//                 });
//             });

//         }
//         if (crtData.response.hops) {
//             var headerRow = table.insertRow();
//             // Add data rows
//             crtData.response.hops.forEach((server, index) => {
//                 if (index == 0) {
//                     Object.keys(server).forEach(key => {
//                         var headerCell = document.createElement('th');
//                         headerCell.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize first letter
//                         headerRow.appendChild(headerCell);
//                     });
//                 }
//                 var row = table.insertRow();
//                 Object.values(server).forEach(value => {
//                     var cell = row.insertCell();
//                     cell.textContent = value;
//                 });
//             });

//         }
//         if (crtData.response.domains) {
//             var headerRow = table.insertRow();
//             // Add data rows
//             crtData.response.domains.forEach((server, index) => {
//                 if (index == 0) {
//                     Object.keys(server).forEach(key => {
//                         var headerCell = document.createElement('th');
//                         headerCell.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize first letter
//                         headerRow.appendChild(headerCell);
//                     });
//                 }
//                 var row = table.insertRow();
//                 Object.values(server).forEach(value => {
//                     var cell = row.insertCell();
//                     cell.textContent = value;
//                 });
//             });

//         }
//         if (crtData.response.domain_count) {
//             var expectedResponseHeaderRow = table.insertRow();
//             var expectedResponseHeaderCell = document.createElement('th');
//             expectedResponseHeaderCell.textContent = 'Domain_count';
//             expectedResponseHeaderCell.colSpan = 2; // Span two columns
//             expectedResponseHeaderRow.appendChild(expectedResponseHeaderCell);
//             // Create data row for expected response
//             var expectedResponseRow = table.insertRow();
//             var expectedResponseCell = document.createElement('td');
//             expectedResponseCell.textContent = crtData.response['domain_count'];
//             expectedResponseCell.colSpan = 2; // Span two columns
//             expectedResponseRow.appendChild(expectedResponseCell)

//         }
//         if (crtData.response.error) {
//             var expectedResponseHeaderRow = table.insertRow();
//             var expectedResponseHeaderCell = document.createElement('th');
//             expectedResponseHeaderCell.textContent = 'Error';
//             expectedResponseHeaderCell.colSpan = 2; // Span two columns
//             expectedResponseHeaderRow.appendChild(expectedResponseHeaderCell);
//             // Create data row for expected response
//             var expectedResponseRow = table.insertRow();
//             var expectedResponseCell = document.createElement('td');
//             expectedResponseCell.textContent = crtData.response['error'];
//             expectedResponseCell.colSpan = 2; // Span two columns
//             expectedResponseRow.appendChild(expectedResponseCell)

//         }
//         if (crtData.response.current_page) {
//             var expectedResponseHeaderRow = table.insertRow();
//             var expectedResponseHeaderCell = document.createElement('th');
//             expectedResponseHeaderCell.textContent = 'current_page';
//             expectedResponseHeaderCell.colSpan = 2; // Span two columns
//             expectedResponseHeaderRow.appendChild(expectedResponseHeaderCell);
//             // Create data row for expected response
//             var expectedResponseRow = table.insertRow();
//             var expectedResponseCell = document.createElement('td');
//             expectedResponseCell.textContent = crtData.response['current_page'];
//             expectedResponseCell.colSpan = 2; // Span two columns
//             expectedResponseRow.appendChild(expectedResponseCell)

//         }
//         if (crtData.response.matches) {
//             var headerRow = table.insertRow();
//             // Add data rows
//             crtData.response.matches.forEach((server, index) => {
//                 if (index == 0) {
//                     Object.keys(server).forEach(key => {
//                         var headerCell = document.createElement('th');
//                         headerCell.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize first letter
//                         headerRow.appendChild(headerCell);
//                     });
//                 }
//                 var row = table.insertRow();
//                 Object.values(server).forEach(value => {
//                     var cell = row.insertCell();
//                     cell.textContent = value;
//                 });
//             });

//         }
//         if (crtData.response.result_count) {
//             var expectedResponseHeaderRow = table.insertRow();
//             var expectedResponseHeaderCell = document.createElement('th');
//             expectedResponseHeaderCell.textContent = 'result_count';
//             expectedResponseHeaderCell.colSpan = 2; // Span two columns
//             expectedResponseHeaderRow.appendChild(expectedResponseHeaderCell);
//             // Create data row for expected response
//             var expectedResponseRow = table.insertRow();
//             var expectedResponseCell = document.createElement('td');
//             expectedResponseCell.textContent = crtData.response['result_count'];
//             expectedResponseCell.colSpan = 2; // Span two columns
//             expectedResponseRow.appendChild(expectedResponseCell)

//         }
//         if (crtData.response.total_pages) {
//             var expectedResponseHeaderRow = table.insertRow();
//             var expectedResponseHeaderCell = document.createElement('th');
//             expectedResponseHeaderCell.textContent = 'total_pages';
//             expectedResponseHeaderCell.colSpan = 2; // Span two columns
//             expectedResponseHeaderRow.appendChild(expectedResponseHeaderCell);
//             // Create data row for expected response
//             var expectedResponseRow = table.insertRow();
//             var expectedResponseCell = document.createElement('td');
//             expectedResponseCell.textContent = crtData.response['total_pages'];
//             expectedResponseCell.colSpan = 2; // Span two columns
//             expectedResponseRow.appendChild(expectedResponseCell)

//         }

//         var resultDiv = document.getElementById('result');
//         resultDiv.innerHTML = ''; // Clear previous content
//         resultDiv.appendChild(table);


//     } catch (error) {
//         console.error('Error fetching data:', error.message);
//         // Handle the error gracefully, e.g., display an error message on the webpage
//     }
// }


async function date_info() {
    // var General_InformationDiv = document.getElementById("General_InformationDiv");
    var date = document.getElementById("date").value;
    body = JSON.stringify({ 'date': date });
    var apiUrl = '/search_data/';

    try {
        // Make a fetch request
        var response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'date': date }),
            cache: 'default'
        });

        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const searchResult = await response.json();
        


        var domainDiv = document.getElementById('domain_Div');
        const domain = searchResult['whois_data'];    
            // Ek Set banayein unique domains ke liye
        let uniqueDomains = new Set();    
            // Har item ka domain Set mein add karein
        domain.forEach((item) => {
            uniqueDomains.add(item.domain);
        });
           // HTML table ka shuruaati tag
        let tableHTML = '<table border="1"><tr><th>S.No.</th><th>Domain</th></tr>';  
            // Counter initialize karein
        let count = 0;   
            // Har unique domain ke liye table row banayein
        uniqueDomains.forEach((domain) => {
                
            count++;
            tableHTML += `<tr><td>${count}</td><td>${domain}</td></tr>`;
        });   
            // HTML table ko complete karein
        tableHTML += '</table>';    
            // Table ko domainDiv element ke andar append karein
        domainDiv.innerHTML = tableHTML;




        
                

        var crtDataDiv = document.getElementById("crt_data_div");
        var CertificateDIV = document.getElementById("CertificateDIV");
        var Issued_CertificatesDIV = document.getElementById("Issued_Certificates_DIV");
        var container = document.getElementById("container_div");
        const cetiData = searchResult['CETI'];
        cetiData.forEach((item, index) => {
            
            var crtInfo = JSON.parse(item.crtidata);
            if (crtInfo.Trust && crtInfo.Trust.length > 0) {
                var table = document.createElement('table');
                var header = table.createTHead();
                var row = header.insertRow(0);

                // Create table header cells
                crtInfo.Trust[0].forEach(function(column) {
                    var th = document.createElement('th');
                    th.textContent = column.replace('_', ' '); // Replace underscores with spaces
                    row.appendChild(th);
                });

                // Populate table with data
                var tbody = table.createTBody();
                crtInfo.Trust.slice(1).forEach(function(rowData) {
                    var row = tbody.insertRow();
                    rowData.forEach(function(cellData) {
                        var cell = row.insertCell();
                        cell.textContent = cellData;
                    });
                });


                container.appendChild(table);
            } else {
                console.log('No Trust data found.');
            }


            var table = document.createElement('table');
            var header = table.createTHead();
            var row = header.insertRow(0);
            var columns = ['issuer_Name', 'crt sh ID', 'Not Before', 'Not After'];
            columns.forEach(function(column) {
                var th = document.createElement('th');
                th.textContent = column;
                row.appendChild(th);
            });
           
            // Populate table with data
            var tbody = table.createTBody();
            crtInfo.Certificates.forEach(function(info) {
                row = tbody.insertRow();
                row.insertCell().textContent = info['issuer_Name'].Name;
                row.insertCell().textContent = info['crt.sh ID'].id;
                row.insertCell().textContent = info['Not_Before'];
                row.insertCell().textContent = info['Not_After'];

            });
            CertificateDIV.appendChild(table);

            var table = document.createElement('table');
            var header = table.createTHead();
            var row = header.insertRow(0);
            var columns = ['Unexpired', 'TOTAL', 'Population', 'Expired'];
            columns.forEach(function(column) {
                var th = document.createElement('th');
                th.textContent = column;
                row.appendChild(th);
            });
          
            var tbody = table.createTBody();
            crtInfo.Issued_Certificates.forEach(function(info) {
                row = tbody.insertRow();
                row.insertCell().textContent = info.Unexpired;
                row.insertCell().textContent = info['TOTAL'];
                row.insertCell().textContent = info.Population;
                row.insertCell().textContent = info.Expired;

            });
            Issued_CertificatesDIV.appendChild(table);
            crtDataDiv.innerHTML = '';
            var caId = crtInfo.crt_sh_CA_ID;
            var textContent = crtInfo.Text_Content.join('<br/>');
            // Display the extracted information in the HTML page
            crtDataDiv.innerHTML = `
             <h1>CA ID: ${caId}</h1>
             <br>${textContent}</br>
         `;

        });




        
        var crtDiv = document.getElementById("crt_data");
        var TransparencyDiv = document.getElementById("TransparencyDiv");
        var FingerprintsDiv = document.getElementById("FingerprintsDiv");
        var Certificate = document.getElementById("Certificate");
        const crtida = searchResult['crtidata'];
        crtida.forEach((item, index) => {

            var crtInfo = JSON.parse(item.cetiddata);
            if (crtInfo.Certificate) {
                var preTag = document.createElement('pre');
            crtInfo.Certificate.forEach(function(info) {
                preTag.textContent += info ;
             });
                Certificate.appendChild(preTag);
                // Your code to manipulate Certificate
            } else {
                console.error("Certificate element not found");
            }   
          
               
    
            var table = document.createElement('table');
            var header = table.createTHead();
            var row = header.insertRow(0);
            var columns = ['Entry #', 'Log Operator', 'Log URL', 'Timestamp'];
            columns.forEach(function(column) {
                var th = document.createElement('th');
                th.textContent = column;
                row.appendChild(th);
            });
            // console.log(crtInfo);
            // Populate table with data
            var tbody = table.createTBody();
            crtInfo["Certificate Transparency"].forEach(function(info) {
                row = tbody.insertRow();
                row.insertCell().textContent = info["Entry #"];
                row.insertCell().textContent = info["Log Operator"];
                row.insertCell().textContent = info["Log URL"];
                row.insertCell().textContent = info["Timestamp"];
    
            });
    
            TransparencyDiv.appendChild(table);
    
            var table = document.createElement('table');
            var header = table.createTHead();
            var row = header.insertRow(0);
            var columns = ['href', 'sha_256'];
            columns.forEach(function(column) {
                var th = document.createElement('th');
                th.textContent = column;
                row.appendChild(th);
            });
            // console.log(crtInfo);
            // Populate table with data
            var tbody = table.createTBody();
            crtInfo["Certificate Fingerprints"].forEach(function(info) {
                row = tbody.insertRow();
                row.insertCell().textContent = info["SHA_256"].href;
                row.insertCell().textContent = info["SHA_256"].sha_256;
            });
    
            FingerprintsDiv.appendChild(table);
    
            var table = document.createElement('table');
            var header = table.createTHead();
            var row = header.insertRow(0);
            var columns = ['Status', 'Revocation Date', 'Provider', 'Mechanism ', 'Last Observed in CRL', 'Last Checked'];
            columns.forEach(function(column) {
                var th = document.createElement('th');
                th.textContent = column;
                row.appendChild(th);
            });
            // console.log(crtInfo);
            // Populate table with data
            var tbody = table.createTBody();
            crtInfo.Revocation.forEach(function(info) {
                row = tbody.insertRow();
                row.insertCell().textContent = info["Status"];
                row.insertCell().textContent = info["Revocation Date"];
                row.insertCell().textContent = info["Provider"];
                row.insertCell().textContent = info["Mechanism"];
                row.insertCell().textContent = info["Last Observed in CRL"];
                row.insertCell().textContent = info["Last Checked"];
    
            });
    
            crtDiv.appendChild(table);
    
            var caId = crtInfo.crt_sh_ID.ID;
            var summary = crtInfo.crt_sh_ID.summary;
            crtDiv.innerHTML = `
                <h1>CA ID: ${caId}</h1>
                <p>summary: ${summary}</p>
            `;
        });
        
    
    

        var crttable = document.getElementById("crttable");
        const crtData = searchResult['CRT_data'];
        crtData.forEach((item, index) => {
            var crtInfo = JSON.parse(item.crtdata);
            var table = document.createElement('table');
            var header = table.createTHead();
            var row = header.insertRow(0);
            var columns = ['ID', 'Logged At', 'Not Before', 'Not After', 'Common Name', 'MatchingIdentities', 'Issuer Name'];
            columns.forEach(function(column) {
                var th = document.createElement('th');
                th.textContent = column;
                row.appendChild(th);
            });
          
            var tbody = table.createTBody();
            crtInfo.forEach(function(info) {
                row = tbody.insertRow();

                row.insertCell().textContent = info.ID.id;
                row.insertCell().textContent = info.loggedAt;
                row.insertCell().textContent = info.NotBefore;
                row.insertCell().textContent = info.NotAfter;
                row.insertCell().textContent = info.CommonName;
                row.insertCell().textContent = info.MatchingIdentities.join(', ');
                row.insertCell().textContent = info.IssuerName.name;
               
            });
            crttable.appendChild(table);
        });


        var CertifDiv = document.getElementById("certificates_div");
        var ReportDataDiv = document.getElementById("ReportDataDiv");
        var issuediv = document.getElementById("issuediv");
        var DNSDiv = document.getElementById("DNSDiv");
        var opensslhandshakediv = document.getElementById("opensslhandshakediv");
        const sslData = searchResult['SSL_data'];
        sslData.forEach((item, index) => {
            var crt = JSON.parse(item.SSLdata);
            const crtInfo = crt[0]
            for (const [key, value] of Object.entries(crtInfo.Certificates)) {
                var p = document.createElement('p');
                var table = document.createElement('table');
                var header = table.createTHead();
                var row = header.insertRow(0);
                var columns = ['Icon', 'Key', 'Value'];
                p.innerHTML = key
                columns.forEach(function(column) {
                    var th = document.createElement('th');
                    th.textContent = column;
                    row.appendChild(th);
                });
                // Populate table with data
                var tbody = table.createTBody();
                value.forEach(function(info) {
                    row = tbody.insertRow();
                    row.insertCell().textContent = info["Icon"];
                    row.insertCell().textContent = info["Key"];
                    row.insertCell().textContent = info["Value"];
                });
                CertifDiv.appendChild(p);
                CertifDiv.appendChild(table);

            }

            var table = document.createElement('table');
            var header = table.createTHead();
            var row = header.insertRow(0);
            var columns = ['Icon', 'Key', 'Value'];
            columns.forEach(function(column) {
                var th = document.createElement('th');
                th.textContent = column;
                row.appendChild(th);
            });
            // Populate table with data
            var tbody = table.createTBody();
            crtInfo.DNS.forEach(function(info) {
                row = tbody.insertRow();
                row.insertCell().textContent = info["Icon"];
                row.insertCell().textContent = info["Key"];
                row.insertCell().textContent = info["Value"];
            });
            DNSDiv.appendChild(table);




            var table = document.createElement('table');
            var header = table.createTHead();
            var row = header.insertRow(0);
            var columns = ['Icon', 'Key', 'Value'];
            columns.forEach(function(column) {
                var th = document.createElement('th');
                th.textContent = column;
                row.appendChild(th);
            });
            // Populate table with data
            var tbody = table.createTBody();
            crtInfo.Report.forEach(function(info) {
                row = tbody.insertRow();
                row.insertCell().textContent = info["Icon"];
                row.insertCell().textContent = info["Key"];
                row.insertCell().textContent = info["Value"];
            });
            ReportDataDiv.appendChild(table);


            var table = document.createElement('table');
            var header = table.createTHead();
            var row = header.insertRow(0);
            var columns = ['Icon', 'Key', 'Value'];
            columns.forEach(function(column) {
                var th = document.createElement('th');
                th.textContent = column;
                row.appendChild(th);
            });
            // Populate table with data
            var tbody = table.createTBody();
            crtInfo.General_Information.forEach(function(info) {
                row = tbody.insertRow();
                row.insertCell().textContent = info["Icon"];
                row.insertCell().textContent = info["Key"];
                row.insertCell().textContent = info["Value"];
            });
            General_InformationDiv.appendChild(table);

            var issue = crtInfo.issue;
            issuediv.innerHTML = `
              <h1>CA ID: ${issue}</h1>
          `;

            var OpenSSL_Handshake = crtInfo.OpenSSL_Handshake.OpenSSL_Handshake;
            opensslhandshakediv.innerHTML = `<pre> OpenSSL_Handshake:${OpenSSL_Handshake}</pre>`;


        });

        var resultDiv = document.getElementById('result');
        const dnsInfo = searchResult['dns_info'];
        dnsInfo.forEach((item, index) => {
           
            let dn = item.dnsview_result.toString().replace(/'/g, '"');
            dnsData = JSON.parse(dn);
            var table = document.createElement('table');
            // Create header row for query object
            var queryHeaderRow = table.insertRow();
            var queryHeaderCell = document.createElement('th');
            queryHeaderCell.textContent = 'Query';
            queryHeaderCell.colSpan = 2; // Span two columns
            queryHeaderRow.appendChild(queryHeaderCell);


            // Create data rows for query object
            Object.entries(dnsData.query).forEach(([key, value]) => {
                var row = table.insertRow();
                var keyCell = row.insertCell();
                keyCell.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize first letter
                var valueCell = row.insertCell();
                valueCell.textContent = value;
               
            });




            if (dnsData.expectedresponse) {
                var expectedResponseHeaderRow = table.insertRow();
                var expectedResponseHeaderCell = document.createElement('th');
                expectedResponseHeaderCell.textContent = 'Expected Response';
                expectedResponseHeaderCell.colSpan = 2; // Span two columns
                expectedResponseHeaderRow.appendChild(expectedResponseHeaderCell);
                // Create data row for expected response
                var expectedResponseRow = table.insertRow();
                var expectedResponseCell = document.createElement('td');
                expectedResponseCell.textContent = dnsData['expectedresponse'];
                expectedResponseCell.colSpan = 2; // Span two columns
                expectedResponseRow.appendChild(expectedResponseCell)
                if (dnsData.response.server) {
                    var headerRow = table.insertRow();
                    Object.keys(dnsData.response.server[0]).forEach(key => {
                        var headerCell = document.createElement('th');
                        headerCell.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize first letter
                        headerRow.appendChild(headerCell);
                    });

                    // Add data rows
                    dnsData.response.server.forEach(server => {
                        var row = table.insertRow();
                        Object.values(server).forEach(value => {
                            var cell = row.insertCell();
                            cell.textContent = value;
                        });
                    });
                }

            }

            if (dnsData.response.records) {
                var headerRow = table.insertRow();
                // Add data rows
                dnsData.response.records.forEach((server, index) => {
                    if (index == 0) {
                        Object.keys(server).forEach(key => {
                            var headerCell = document.createElement('th');
                            headerCell.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize first letter
                            headerRow.appendChild(headerCell);
                        });
                    }
                    var row = table.insertRow();
                    Object.values(server).forEach(value => {
                        var cell = row.insertCell();
                        cell.textContent = value;
                    });
                });

            }
            if (dnsData.response.hops) {
                var headerRow = table.insertRow();
                // Add data rows
                dnsData.response.hops.forEach((server, index) => {
                    if (index == 0) {
                        Object.keys(server).forEach(key => {
                            var headerCell = document.createElement('th');
                            headerCell.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize first letter
                            headerRow.appendChild(headerCell);
                        });
                    }
                    var row = table.insertRow();
                    Object.values(server).forEach(value => {
                        var cell = row.insertCell();
                        cell.textContent = value;
                    });
                });

            }
            if (dnsData.response.domains) {
                var headerRow = table.insertRow();
                // Add data rows
                dnsData.response.domains.forEach((server, index) => {
                    if (index == 0) {
                        Object.keys(server).forEach(key => {
                            var headerCell = document.createElement('th');
                            headerCell.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize first letter
                            headerRow.appendChild(headerCell);
                        });
                    }
                    var row = table.insertRow();
                    Object.values(server).forEach(value => {
                        var cell = row.insertCell();
                        cell.textContent = value;
                    });
                });

            }
            if (dnsData.response.domain_count) {
                var expectedResponseHeaderRow = table.insertRow();
                var expectedResponseHeaderCell = document.createElement('th');
                expectedResponseHeaderCell.textContent = 'Domain_count';
                expectedResponseHeaderCell.colSpan = 2; // Span two columns
                expectedResponseHeaderRow.appendChild(expectedResponseHeaderCell);
                // Create data row for expected response
                var expectedResponseRow = table.insertRow();
                var expectedResponseCell = document.createElement('td');
                expectedResponseCell.textContent = dnsData.response['domain_count'];
                expectedResponseCell.colSpan = 2; // Span two columns
                expectedResponseRow.appendChild(expectedResponseCell)

            }
            if (dnsData.response.error) {
                var expectedResponseHeaderRow = table.insertRow();
                var expectedResponseHeaderCell = document.createElement('th');
                expectedResponseHeaderCell.textContent = 'Error';
                expectedResponseHeaderCell.colSpan = 2; // Span two columns
                expectedResponseHeaderRow.appendChild(expectedResponseHeaderCell);
                // Create data row for expected response
                var expectedResponseRow = table.insertRow();
                var expectedResponseCell = document.createElement('td');
                expectedResponseCell.textContent = dnsData.response['error'];
                expectedResponseCell.colSpan = 2; // Span two columns
                expectedResponseRow.appendChild(expectedResponseCell)

            }
            if (dnsData.response.current_page) {
                var expectedResponseHeaderRow = table.insertRow();
                var expectedResponseHeaderCell = document.createElement('th');
                expectedResponseHeaderCell.textContent = 'current_page';
                expectedResponseHeaderCell.colSpan = 2; // Span two columns
                expectedResponseHeaderRow.appendChild(expectedResponseHeaderCell);
                // Create data row for expected response
                var expectedResponseRow = table.insertRow();
                var expectedResponseCell = document.createElement('td');
                expectedResponseCell.textContent = dnsData.response['current_page'];
                expectedResponseCell.colSpan = 2; // Span two columns
                expectedResponseRow.appendChild(expectedResponseCell)

            }
            if (dnsData.response.matches) {
                var headerRow = table.insertRow();
                // Add data rows
                dnsData.response.matches.forEach((server, index) => {
                    if (index == 0) {
                        Object.keys(server).forEach(key => {
                            var headerCell = document.createElement('th');
                            headerCell.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize first letter
                            headerRow.appendChild(headerCell);
                        });
                    }
                    var row = table.insertRow();
                    Object.values(server).forEach(value => {
                        var cell = row.insertCell();
                        cell.textContent = value;
                    });
                });

            }
            if (dnsData.response.result_count) {
                var expectedResponseHeaderRow = table.insertRow();
                var expectedResponseHeaderCell = document.createElement('th');
                expectedResponseHeaderCell.textContent = 'result_count';
                expectedResponseHeaderCell.colSpan = 2; // Span two columns
                expectedResponseHeaderRow.appendChild(expectedResponseHeaderCell);
                // Create data row for expected response
                var expectedResponseRow = table.insertRow();
                var expectedResponseCell = document.createElement('td');
                expectedResponseCell.textContent = dnsData.response['result_count'];
                expectedResponseCell.colSpan = 2; // Span two columns
                expectedResponseRow.appendChild(expectedResponseCell)

            }
            if (dnsData.response.total_pages) {
                var expectedResponseHeaderRow = table.insertRow();
                var expectedResponseHeaderCell = document.createElement('th');
                expectedResponseHeaderCell.textContent = 'total_pages';
                expectedResponseHeaderCell.colSpan = 2; // Span two columns
                expectedResponseHeaderRow.appendChild(expectedResponseHeaderCell);
                // Create data row for expected response
                var expectedResponseRow = table.insertRow();
                var expectedResponseCell = document.createElement('td');
                expectedResponseCell.textContent = dnsData.response['total_pages'];
                expectedResponseCell.colSpan = 2; // Span two columns
                expectedResponseRow.appendChild(expectedResponseCell)

            }
            resultDiv.appendChild(table);

        });

        var whoisDiv = document.getElementById('whois_Div');
        const whoi= searchResult['whois_data'];
        whoi.forEach((item, index) => {
            dnsData = JSON.parse(item.whois);
            
            const keysToExtract = ["domain_name", "creation_date", "expiration_date", "registrar"];

            // Create table element
            let whoisTable = document.createElement("table");
            let tbody = document.createElement("tbody");
            
            // Iterate over each key in dnsData
            keysToExtract.forEach(key => {
                // Check if the key exists in dnsData
                if (dnsData.hasOwnProperty(key)) {
                    // Create key-value rows
                    let row = document.createElement("tr");
                    let keyCell = document.createElement("td");
                    let valueCell = document.createElement("td");
            
                    keyCell.textContent = key;
                    valueCell.textContent = dnsData[key];
                    row.appendChild(keyCell);
                    row.appendChild(valueCell);
                    tbody.appendChild(row);
                }
            });
            
            // Create title row
            let titleRow = document.createElement("tr");
            let titleCell = document.createElement("th");
            titleCell.colSpan = 2; // Span the title cell across two columns
            titleCell.textContent = "Whois";
            titleRow.appendChild(titleCell);
            
            // Insert the title row at the beginning of the table body
            tbody.insertBefore(titleRow, tbody.firstChild);
            
            // Append table body to table
            whoisTable.appendChild(tbody);
            
            // Append table to whoisDiv or any other desired container
            whoisDiv.appendChild(whoisTable);
            

            
        });

         
        var cmDiv = document.getElementById('cms');
        const cms = searchResult['cmsscan_data'];
        cms.forEach((item, index) => {
            let domain_name = item.domain;
            let dnsData = JSON.parse(item.cmss);
            
            // Create elements to display the CMS information
            let div = document.createElement("div");
            div.setAttribute("class", "card mt-3");
        
            // Create <h3> element for domain_name
            let h3 = document.createElement("h3");
            h3.textContent = domain_name;
            h3.setAttribute("class", "card-header");
            div.appendChild(h3);
        
            let bdy = document.createElement("div");
            bdy.setAttribute("class", "card-body");
        
            let pre = document.createElement("pre");
            pre.setAttribute("style", "white-space: pre-wrap;word-break: break-all;");
            pre.innerHTML = dnsData["CMS"];
        
            bdy.appendChild(pre);
            div.appendChild(bdy);
        
            cmDiv.appendChild(div);
        });





        var wpsDiv = document.getElementById('wps_div');
        const wpsd = searchResult['wps_data'];

        wpsd.forEach((item, index) => {
            let domain_name = item.domain;
            let wpssData = item.wpss;

            // Create elements to display the WPS information
            let div = document.createElement("div");
            div.setAttribute("class", "card mt-3");

            // Create <h3> element for domain_name
            let h3 = document.createElement("h3");
            h3.textContent = domain_name;
            h3.setAttribute("class", "card-header");
            div.appendChild(h3);

            let table = document.createElement("table");
            table.setAttribute("class", "table");

            // Extract and display properties of the "banner" object
            let banner = wpssData.banner;
            for (const [key, value] of Object.entries(banner)) {
                let row = document.createElement("tr");
                let keyCell = document.createElement("td");
                let valueCell = document.createElement("td");

                keyCell.textContent = key;
                valueCell.textContent = value;

                row.appendChild(keyCell);
                row.appendChild(valueCell);
                table.appendChild(row);
            }

            // Display other properties such as "scan_aborted" and "target_url"
            let row1 = document.createElement("tr");
            let keyCell1 = document.createElement("td");
            let valueCell1 = document.createElement("td");
            keyCell1.textContent = "scan_aborted";
            valueCell1.textContent = wpssData.scan_aborted;
            row1.appendChild(keyCell1);
            row1.appendChild(valueCell1);
            table.appendChild(row1);

            let row2 = document.createElement("tr");
            let keyCell2 = document.createElement("td");
            let valueCell2 = document.createElement("td");
            keyCell2.textContent = "target_url";
            valueCell2.textContent = wpssData.target_url;
            row2.appendChild(keyCell2);
            row2.appendChild(valueCell2);
            table.appendChild(row2);

            div.appendChild(table);
            wpsDiv.appendChild(div);
        });



        var wafDiv = document.getElementById('waf_Div');
        const wa = searchResult['waf_data'];
        
        wa.forEach((item, index) => {
            let domain_name = item.domain;
            let dnsData = JSON.parse(item.wafee);
            
            for (const key in dnsData) {
                if (dnsData.hasOwnProperty(key)) {
                    const value = dnsData[key];        
                    let div = document.createElement("div");
        
                    // Create <h3> element for domain_name
                    let h3 = document.createElement("h3");
                    h3.textContent = domain_name;
                    div.appendChild(h3);
        
                    let h5 = document.createElement("h5");
                    h5.innerHTML = key;
                    div.appendChild(h5);
                    let bdy = document.createElement("div");
        
                    let pre = document.createElement("pre");
                    pre.setAttribute("style", "white-space: pre-wrap;word-break: break-all;");
                    pre.innerHTML = JSON.stringify(value, null, 4); // Convert value to string for display
                    bdy.appendChild(pre);
        
                    div.appendChild(bdy);
                    wafDiv.appendChild(div);
                }
            }
        });                   

        var nmaDiv = document.getElementById('nmap_Div');
        const nmape = searchResult['nmap_data'];
        nmape.forEach((tupleArray) => {
               
                // Create a heading element (<h6>) for NMAP
            let heading = document.createElement("h3");
            heading.textContent = "NMAP:";
            nmaDiv.appendChild(heading);
            let pre = document.createElement("pre");
            pre.innerHTML = tupleArray.nmape;
            nmaDiv.appendChild(pre);
        });
            
        const fuzzDiv=document.getElementById('fuzz_Div')
        const  fuzze = searchResult['fuzzer_data'] ;
        fuzze.forEach((item)=>{
            let jsonString = item.fuzzz.replace(/'/g, "");
            let newJson = JSON.parse(jsonString);
                var table = document.createElement('table');
                var header = table.createTHead();
                var row = header.insertRow(0);
                var columns = ['find', 'length', 'code','word','total_char'];
                columns.forEach(function(column) {
                        var th = document.createElement('th');
                        th.textContent = column;
                        row.appendChild(th);
                });
                    // Populate table with data
                var tbody = table.createTBody();
                newJson.forEach(function(info) {
                        row = tbody.insertRow();
                        row.insertCell().textContent = info["find"];
                        row.insertCell().textContent = info["length"];
                        row.insertCell().textContent = info["code"];
                        row.insertCell().textContent = info["word"];
                        row.insertCell().textContent = info["total_char"];
                });
                fuzzDiv.appendChild(table);
                
                
        });

        const dnsdumpste = searchResult['dnsdumpster_data'];
        dnsdumpste.forEach((item) => {
          
            let dnsData = JSON.parse(item.dnsdumpster);
            
                // Process each key in dnsData
            for (let key in dnsData) {
                dnsData[key] = JSON.parse(dnsData[key]);
                
            }
            
                // Extract data from dnsData
            var dns = dnsData['dns'];
            var host = dnsData['host'];
            var txt = dnsData['txt'];
            var mx = dnsData['mx'];

            // Create HTML tables for each type of data
            var table_dns = "<h2>DNS</h2>";
            table_dns += "<table>";
            table_dns += "<th>NameServer</th>";
            table_dns += "<th>IP</th>";
            table_dns += "<th>Domain</th>";
            dns.DNS.forEach(element => {
                table_dns += `<tr><td>${element.dns}</td><td>${element.ip}</td><td>${element.domain}</td></tr>`;
            });
            table_dns += "</table>";

            var table_txt = "<br><h2>TXT</h2>";
            table_txt += '<table>'
            txt.TXT.forEach(function (txtdata){
                table_txt += `<tr><td>${txtdata}</td></tr>`;
            });
            table_txt += '</table>'

            var table_mx = "<br><h2>MX</h2>"
            table_mx += '<table>';
            table_mx += '<th>MXServer</th>'
            table_mx += '<th>IP</th>'
            table_mx += '<th>domain</th>'
            mx.MX.forEach(function (mxdata){
                table_mx += `<tr><td>${mxdata.dns}</td><td>${mxdata.ip}</td><td>${mxdata.domain}</td></tr>`;
            });
            table_mx += '</table>';

            var table_host = '<br><h2>SUB Domains</h2>';
            table_host += '<table>';
            table_host += '<th>Domains</th>';
            table_host += '<th>IP</th>';
            table_host += '<th>Hosted</th>';
            host.SUBDomain.forEach(function (hostdata){
                table_host += `<tr><td>${hostdata.domains}</td><td>${hostdata.ip}</td><td>${hostdata.hosted}</td></tr>`
            });
            table_host += '</table>';

            // Display the tables
            document.querySelector('.dnsdumpD').innerHTML += table_dns + table_mx + table_txt + table_host;
        });


          


        var buildwitDiv = document.getElementById('buildwit_Div');
        var buildwit = searchResult['buildwith_data'];
       
                // Create a single table outside the loop
        var table = document.createElement('table');
        var header = table.createTHead();
        var row = header.insertRow(0);
        var columns = ['Categories', 'Name', 'Description', 'Link', 'Tag'];
                
        columns.forEach(function(column) {
            var th = document.createElement('th');
            th.textContent = column;
            row.appendChild(th);
        });
                
                // Iterate over each element in buildwith_data
        buildwit.forEach(element => {
                    // Iterate over the nested buildwith array
            element.buildwith.forEach(buildwithElement => {
                        // Populate table with data for each element in the nested array
                var tbody = table.createTBody();
                var row = tbody.insertRow();
                row.insertCell().textContent = buildwithElement["Categories"];
                row.insertCell().textContent = buildwithElement["Name"];
                row.insertCell().textContent = buildwithElement["Description"];
                row.insertCell().textContent = buildwithElement["Link"];
                row.insertCell().textContent = buildwithElement["Tag"];
            });
            
        });
         // Append the table to buildwitDiv after the loop
        buildwitDiv.appendChild(table);   
                   
               
        const Virus = searchResult['VirusTotal_data'];
      
        Virus.forEach(element => {
            element.vir_result.forEach(vtdataElement => {
                var table_scan_result = "<br><h1>Virus Total</h1>";
                table_scan_result += "<h3>Scan Result</h3>";
                table_scan_result += `<p><b>Last Scan:</b> ${new Date(vtdataElement.attributes.last_analysis_date * 1000)}</p>`;
                table_scan_result += "<table>";
                table_scan_result += "<th>Engine</th><th>Category</th><th>Result</th><th>Method</th>"
                    
                for (const engine in vtdataElement.attributes.last_analysis_results) {
                    const result = vtdataElement.attributes.last_analysis_results[engine];
                    table_scan_result += `<tr><td>${engine}</td><td>${result.category}</td><td>${result.result}</td><td>${result.method}</td></tr>`;
                }
                    
                table_scan_result += "</table>";

                    // Analysis Status
                const last_analysis_stats = vtdataElement.attributes.last_analysis_stats;
                table_scan_result += "<h3>Analysis Status</h3>";
                table_scan_result += "<table>";
                table_scan_result += `<tr><td><b>Harmless</b></td><td>${last_analysis_stats.harmless}</td></tr>`;
                table_scan_result += `<tr><td><b>Malicious</b></td><td>${last_analysis_stats.malicious}</td></tr>`;
                table_scan_result += `<tr><td><b>Suspicious</b></td><td>${last_analysis_stats.suspicious}</td></tr>`;
                table_scan_result += `<tr><td><b>Timeout</b></td><td>${last_analysis_stats.timeout}</td></tr>`;
                table_scan_result += `<tr><td><b>Undetected</b></td><td>${last_analysis_stats.undetected}</td></tr>`;
                table_scan_result += "</table>";

                // Request and Response
                const last_http_response_headers = vtdataElement.attributes.last_http_response_headers;
                if (last_http_response_headers) {
                    var table_res = "<h3>Response Analysis</h3>";
                    table_res += `<p><b>URL:</b> ${vtdataElement.attributes.last_final_url}</p>`;
                    table_res += `<p><b>Response Code:</b> ${vtdataElement.attributes.last_http_response_code}</p>`;
                    table_res += `<p><b>Response Length:</b> ${vtdataElement.attributes.last_http_response_content_length}</p>`;
                    table_res += `<p><b>Last Modification Date:</b> ${new Date(vtdataElement.attributes.last_modification_date * 1000)}</p>`;
                    table_res += `<p><b>Last Submission Date:</b> ${new Date(vtdataElement.attributes.last_submission_date * 1000)}</p>`;
                    table_res += "<table>";
                    table_res += "<th>Header</th><th>Value</th>";
                    for (const header in last_http_response_headers) {
                        table_res += `<tr><td>${header}</td><td>${last_http_response_headers[header]}</td></tr>`;
                    }
                    table_res += "</table>";
                }

                // Other data
                var otherdata = '';
                if (vtdataElement.attributes.outgoing_links) {
                    otherdata += '<br><table>';
                    otherdata += '<th>Outgoing Links</th>';
                    vtdataElement.attributes.outgoing_links.forEach(od => {
                        otherdata += `<tr><td>${od}</td></tr>`;
                    });
                    otherdata += '</table>';
                }

                otherdata += '<br><table>';
                otherdata += '<th>Redirection Chain</th>';
                vtdataElement.attributes.redirection_chain.forEach(rc => {
                    otherdata += `<tr><td>${rc}</td></tr>`;
                });
                otherdata += '</table>';

                otherdata += `<br><p><b>Reputation:</b> ${vtdataElement.attributes.reputation}</p>`;

                otherdata += '<br><h3>Site Category</h3><table>';
                for (const category in vtdataElement.attributes.categories) {
                    otherdata += `<tr><td>${category}</td><td>${vtdataElement.attributes.categories[category]}</td></tr>`;
                }
                otherdata += '</table>';

                if (vtdataElement.attributes.html_meta) {
                    otherdata += '<br><h3>HTML Meta</h3><table>';
                    for (const meta in vtdataElement.attributes.html_meta) {
                        otherdata += `<tr><td>${meta}</td><td>${vtdataElement.attributes.html_meta[meta]}</td></tr>`;
                    }
                    otherdata += '</table>';
                }

                    // Display the data
                document.querySelector('.vtotaldiv').innerHTML += table_scan_result + table_res + otherdata;
            });
        });            
    
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
};

     
async function search() {
    try {
        const results = await Promise.all([
            dnsdump(),
            whois(),
            crt_info(),
            ssl_info(),
            vtotal(),
            nmap(),
            fuzz(),
            buldwith(),
            cmsscan(),
            wafscan(),
            
        ]);
        
    } catch (error) {
        console.error("Error occurred during search:", error);
    }
}

