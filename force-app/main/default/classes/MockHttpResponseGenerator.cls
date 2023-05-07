@isTest
global class MockHttpResponseGenerator implements HttpCalloutMock {
    global HTTPResponse respond(HTTPRequest req) {       
        System.assertEquals('POST', req.getMethod());
        
        // Create a fake response
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setBody('request caught');
        system.debug(res.getBody());
        if(req.getBody().endsWith('abc')){
            res.setStatusCode(400);
        }else{
            res.setStatusCode(200);
        }        
        return res;
    }
}