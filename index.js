const AWS=require("aws-sdk");


exports.handler = (event,context,callback) => {

    //////////// These variables should be defined as stage variables in API Gateway`

    let site=""; 
    let s3bucket_read_primary = "";
    let s3bucket_read_backup = "";		
  
    ////////////

    const s3 = new AWS.S3();
    let path=""; let stage="";
    let response="";
    let bodyresponse="";
    let filename=""; let s3filename="";
    let filecontent=""; let params="";
    let client_ip = event.headers['X-Forwarded-For'];
    let client_useragent = event.headers['User-Agent'];	

    if (event.stageVariables!=null && typeof event.stageVariables.debug != undefined) {
     	if (event.stageVariables.debug==1) {
     		console.log(context);
     		console.log(event);
     	}
    }

    client_ip = client_ip == null ? event.requestContext.identity.sourceIp : client_ip;
    client_useragent = client_useragent == null ? event.requestContext.identity.userAgent : client_useragent;

    if (event.stageVariables==null || event.stageVariables.site==null || event.stageVariables.s3bucket_read_primary==null || event.stageVariables.s3bucket_read_backup==null) {
	response="Status=PIK_API_CONFIG_ERROR Site=undefined Stage=undetermined Path=undetermined ClientIP=" + client_ip + " ClientUA=\"" + client_useragent + "\"" + 
	" File=not_applicable Message=\"Unable to obtain the following stage variables: site, s3bucket_read_primary, s3bucket_read_backup. Check API Gateway configuration.\"";
     	console.log(response);
	console.log(event);
	return callback(null,{ statusCode: 500, body: JSON.stringify(response) } );
    } else {
	site=event.stageVariables.site;
	s3bucket_read_primary=event.stageVariables.s3bucket_read_primary;
	s3bucket_read_backup=event.stageVariables.s3bucket_read_backup;
    }  

    if (event.requestContext.stage) {
        stage=event.requestContext.stage.toLowerCase();
    } else {
        response="Status=PIK_API_CONFIG_ERROR Site=" + site + " Stage=undefined Path=undetermined ClientIP=" + client_ip + " ClientUA=\"" + client_useragent + "\"" + 
	" File=not_applicable Message=\"Unable to obtain stage value. Check API Gateway configuration to ensure stage has been deployed.\"";
        console(response);
        console(event);
        return callback(null,{ statusCode: 500, body: JSON.stringify(response) } );
    }
    if (event.resource) {
        path=event.resource;        
    } else {
        response="Status=PIK_API_CONFIG_ERROR Site=" + site + " Stage=" + stage + " Path=undefined ClientIP=" + client_ip + " ClientUA=\"" + client_useragent + "\"" + 
	" File=not_applicable Message=\"Unable to obtain path value. Check API Gateway configuration.\"";
        console(response);
        console(event);
        return callback(null,{ statusCode: 500, body: JSON.stringify(response) } );
    }
    

    let response_str="Site=" + site + " Stage=" + stage + " Path=" + path + " ClientIP=" + client_ip + " ClientUA=\"" + client_useragent + "\"";

    switch(path) {
     
     case "/healthcheck":
        let healthcheck_response="";
        params = {
		Bucket: s3bucket_read_primary,
		Prefix: stage,
		MaxKeys: 4
		};

        // If stage variable FORCE_SITE_FAILURE is set to 1, return HEALTHCHECK_FAIL

        if (event.stageVariables!=null && typeof event.stageVariables.FORCE_SITE_FAILURE != undefined) {
         	if (event.stageVariables.FORCE_SITE_FAILURE==1) {
			response="Status=PIK_HEALTHCHECK_FAIL " + response_str + " File=not_applicable Message=\"FORCE_SITE_FAILURE variable is set in stage " + stage + "\"";
			console.log(response);
			console.log(event);
			healthcheck_response = { statusCode: 500, body: JSON.stringify(response) };
			return callback(null,healthcheck_response);
        	}
    	}

        // else continue
        
        // In order to consider a positive healthcheck, there should be at least one file inside the stage folder. 

	s3.listObjectsV2(params, function(err,data) {
		if (err) {
			response="Status=PIK_HEALTHCHECK_FAIL " + response_str + " File=not_applicable Message=\"Unable to find config files in folder " + stage + 
				" in bucket " + s3bucket_read_primary + "\""; 
			console.log(response);
			console.log(err);
			healthcheck_response = { statusCode: 500, body: JSON.stringify(response) };
			return callback(null,healthcheck_response);
		} else {
			if (data.KeyCount > 1 ) {   // the folder counts as one key. In order to ensure there are config files inside the folder, keyCount must be > 1	
				response="Status=PIK_HEALTHCHECK_SUCCESS " + response_str + " File=not_applicable Message=\"Health check successful.\"";
				console.log(response);
				healthcheck_response = { statusCode: 200, body: JSON.stringify(response) };
				return callback(null,healthcheck_response);
			} else {	
				response="Status=PIK_HEALTHCHECK_FAIL " + response_str + " File=not_applicable Message=\"Unable to find config files in folder " + stage + 
					" in bucket " + s3bucket_read_primary + "\"";
				console.log(response);
				console.log(data);
				healthcheck_response = { statusCode: 500, body: JSON.stringify(response) };
				return callback(null,healthcheck_response);
			}
		}
	});

	break;


     case "/getconfig":

	let returndata;
	let contenttype;
	let cachecontrol;
    	if (event.queryStringParameters!=null && event.queryStringParameters.file!=null && event.queryStringParameters.file!="") {
		s3filename = stage + "/" + event.queryStringParameters.file;
		s3filename = s3filename.replace(/\?.*/g,"");
    	} 
	else {
		response="Status=PIK_GETCONFIG_REQUEST_ERROR " + response_str + " File=unknown Message=\"Request did not specify file in query string.\"";	
 		console.log(response);
		console.log(event);
		bodyresponse={ statusCode:500, body: JSON.stringify(response) };
		return callback(null,bodyresponse);
        } 

        // Read primary config location
        params = {
                Bucket: s3bucket_read_primary,   // Read from local region bucket 
                Key: s3filename
                };

 	s3.getObject(params, function(err,data){
        	if (err) {
			response="Status=PIK_S3READ_ERROR_PRIMARY " + response_str + " File=" + s3filename + " Message=\"Unable to read config file from bucket " +  
                                 s3bucket_read_primary + ". Attempting to read backup in bucket " + s3bucket_read_backup + "\""; 
                	console.log(response);
			console.log(err);
                        // Reading from local bucket failed. Retry backup bucket
                        params = { Bucket: s3bucket_read_backup, Key: s3filename };
                        s3.getObject(params, function(err,data){
				if (err) {
					response="Status=PIK_S3READ_ERROR_BACKUP " + response_str + " File=" + s3filename + " Message=\"Unable to read " + stage + " backup config file " + 
                                  	s3filename + " in bucket " + s3bucket_read_backup + ". Exiting with error.\"";
                			console.log(response);
					console.log(err,event);
                			return callback(null, { statusCode: 404, body: JSON.stringify(response) });
				} 
				else {
					returndata=data.Body.toString();
					if (data.ContentType) { contenttype=data.ContentType; }
						else { contenttype="application/json"; }
					if (data.CacheControl) { cachecontrol=data.CacheControl; }
						else { cachecontrol="no-cache, no-store, must-revalidate"; }
					response="Status=PIK_S3READ_SUCCESS_BACKUP " + response_str + " File=" + s3filename + " Message=\"Successfully read " + stage + 
						" config file " + s3filename + 
				        	 " from backup bucket " + s3bucket_read_backup + ". Content-Type: " + contenttype + "\"";
					console.log(response);
					bodyresponse={ 	statusCode: 200,
							headers: {
								'Content-Type': contenttype,
								'Cache-Control': cachecontrol
								},
							body: returndata
						     };
					return callback(null,bodyresponse);		
				}
          		});
        	}
        	else {
                	returndata=data.Body.toString();
			if (data.ContentType) { contenttype=data.ContentType; }
                        	else { contenttype="application/json"; }
			if (data.CacheControl) { cachecontrol=data.CacheControl; }
                        	else { cachecontrol="no-cache, no-store, must-revalidate"; }
			response="Status=PIK_S3READ_SUCCESS_PRIMARY " + response_str + " File=" + s3filename + " Message=\"Successfully read " + stage + " config file " + s3filename +  
				  " from bucket " + s3bucket_read_primary + ". Content-Type: " + contenttype + "\"";
                	console.log(response);
        		bodyresponse={
                		statusCode: 200,
                		headers: {
                        		'Content-Type': contenttype,
                        		'Cache-Control': cachecontrol
                			},
                		body: returndata
       			 };
       		 	return callback(null,bodyresponse);
        	}
 	});
	break;
   
    }

};

