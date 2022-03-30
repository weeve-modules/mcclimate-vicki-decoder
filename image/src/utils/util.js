const { NESTED_RESPONSE, CUSTOM_FIELDS } = require('../config/config')
const formatPayload=(json)=>{
    let output={
        //convert ISO date time to timestamp
        "timestamp": (new Date(json.payload.rxInfo[0]["time"])).getTime(),
        "devEUI":json.payload["devEUI"],
        "deviceName":json.payload["deviceName"]
    };    
    let fields=[];
    if (CUSTOM_FIELDS!=='' && CUSTOM_FIELDS.indexOf(',')!==-1)
        fields=CUSTOM_FIELDS.trim().split(',');
    else if (CUSTOM_FIELDS!=='')
        fields.push(CUSTOM_FIELDS);
    //not nested, no custom fields
    if (fields.length==0 && NESTED_RESPONSE=='no'){
        Object.keys(json.payload.data).forEach(key=>{
            output[key]=json.payload.data[key];
        });
    }
    //nested, no custom fields
    if (fields.length==0 && NESTED_RESPONSE=='yes'){
        output["data"]=json.payload.data;
    }
    //not nested, with custom fields
    if (fields.length!=0 && NESTED_RESPONSE=='no'){
        let keys=Object.keys(json.payload.data);
        fields.forEach(field=>{
            if (keys.indexOf(field)!==-1){
                output[field]=json.payload.data[field];
            }
        });
    }
    //nested, with custom fields
    if (fields.length!=0 && NESTED_RESPONSE=='yes'){
        let keys=Object.keys(json.payload.data);
        output["data"]={};
        fields.forEach(field=>{
            if (keys.indexOf(field)!==-1){
                output["data"][field]=json.payload.data[field];
            }
        });
    }
    return output;
}
module.exports={
    formatPayload
}