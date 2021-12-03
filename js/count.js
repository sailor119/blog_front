var caution=false

function setCookie(name, value, expires, path, domain, secure)
        {
         var curCookie=name+"="+escape(value) +
         ((expires)?";expires="+expires.toGMTString() : "") +
         ((path)?"; path=" + path : "") +
         ((domain)? "; domain=" + domain : "") +
         ((secure)?";secure" : "")
         if(!caution||(name + "=" + escape(value)).length <= 4000)
         {
         document.cookie = curCookie
         } 
         else if(confirm("Cookie exceeds 4KB and will be cut!"))
         {
         document.cookie = curCookie
         }
        }

function getCookie(name)
        {
         var prefix = name + "=";
         var cookieStartIndex = document.cookie.indexOf(prefix);
         if (cookieStartIndex == -1)
         {
         return null;
         }

         var cookieEndIndex=document.cookie.indexOf(";",cookieStartIndex+prefix.length)
         if(cookieEndIndex == -1)
         {
         cookieEndIndex = document.cookie.length
         }
         return unescape(document.cookie.substring(cookieStartIndex+prefix.length,cookieEndIndex))
        }

        // use to generate random token strings to identified user
        function generateToken(length){
//edit the token allowed characters
                var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
                var b = [];
                for (var i=0; i<length; i++) {
                        var j = (Math.random() * (a.length-1)).toFixed(0);
                        b[i] = a[j];
                }
                return b.join("");
        }

function fixDate(date)
        {
         var base=new Date(0)
         var skew=base.getTime()
         if(skew>0)
         {
         date.setTime(date.getTime()-skew)
         }
        };

function updateItem(visitType, num){
        let visitObj = {
                'pv': {
                        'id': 'page-view',
                        'failedInfo': 'query page view info failed',
                        'successInfo': 'This page has been visit for ',
                        'suffix': ' times'
                },
                'uv': {
                        'id': 'unique-visitor',
                        'failedInfo': 'query unique visitor info failed',
                        'successInfo': 'This website has been visit by ',
                        'suffix': ' visitors'
                }
        };
        let now = (new Date()).toGMTString();
        $.ajax({
                url:"https://8qwdmhymka.execute-api.us-east-1.amazonaws.com/visitors/"+visitType,
                type: "PUT",
                data: JSON.stringify({
                        visitType: visitType,
                        info: {
                                num: num,
                                now: now
                        }
                }),
                contentType: "application/json",
                success: function(data){
                        data = JSON.parse(data);
                        if (!data || !data.Attributes.info.num){
                                document.getElementById(visitObj[visitType]['id']).innerHTML = visitObj[visitType]['failedInfo'];
                        }else{
                                document.getElementById(visitObj[visitType]['id']).innerHTML = visitObj[visitType]['successInfo'] +
                                        data.Attributes.info.num + visitObj[visitType]['suffix'];
                        }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                        document.getElementById(visitObj[visitType]['id']).innerHTML = visitObj[visitType]['failedInfo'];
                }
        })
};
// main code//
var now=new Date()
fixDate(now)
now.setTime(now.getTime() + 24 * 60 * 60 * 1000)
var token = getCookie("token")

// if didn't find token, means it was the the first time access the website
// should update pv and uv
if(!token)
{
        token = generateToken(16);
        $.ajax({url: "https://8qwdmhymka.execute-api.us-east-1.amazonaws.com/visitors/uv", success:function(data){
// if return uv value is undefined. output error message.
        data = JSON.parse(data);
        if (!data || !data.Item.info) {
                document.getElementById('unique-visitor').innerHTML = "query unique visitor info failed"
        } else {
                updateItem('uv', data.Item.info.num+1);
        }
        }});
// else it wasn't the first time to access the website, so only need to update pv
        $.ajax({url: "https://8qwdmhymka.execute-api.us-east-1.amazonaws.com/visitors/pv", success:function(data){
                //if return pv value is undefind. output error message
                data = JSON.parse(data);
                if (!data || !data.Item.info) {
                        document.getElementById('page-view').innerHTML="query page view info failed"
                } else {
                        updateItem('pv', data.Item.info.num+1);
                }
        }});
}
// else it wasn't the first time to access the website, so only need to update pv
else
{
        $.ajax({url: "https://8qwdmhymka.execute-api.us-east-1.amazonaws.com/visitors/uv", success:function(data){
        data = JSON.parse(data);
        if(!data || !data.Item){
                        document.getElementById('unique-visitor').innerHTML="query uniqure visitor info failed"
                } else {
                        document.getElementById('unique-visitor').innerHTML="This web site had been visit by " +
                        data.Item.info.num + " vistors";
                } 
        }});
        $.ajax({url: "https://8qwdmhymka.execute-api.us-east-1.amazonaws.com/visitors/pv", success:function(data){
        data = JSON.parse(data);        
        if(!data || !data.Item.info.num) {
                        document.getElementById('page-view').innerHTML="query page view info failed"
                } else {
                        updateItem('pv', data.Item.info.num+1);
                }
        }});
}
setCookie("token", token, now)