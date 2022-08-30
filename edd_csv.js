import csv from 'csv-parser';
import fetch from 'node-fetch';
import fs from 'fs'

const resultArray = [];
fs.createReadStream('zipcodes.csv')
  .pipe(csv())
  .on('data', async (data) => {
    let dzip = data["Recipient Zip Code"];
    var responsePromise = getEdd('rgg', 'fedex', 'SP', 'FEDEX GROUND', '2022-08-30', 'US', '40165', 'US', dzip);
    resultArray.push(responsePromise);
  })
  .on('end', async () => {
    console.log(JSON.stringify(await Promise.all(resultArray)));
    console.log("done");
  });


const getEdd = async (retailer, carrier, carrier_service, carrier_service_description, shipDate, oc, ozip, dc, dzip) => {
  let request = {
    "atlas": {
      "retailer_moniker": retailer,
      "carrier_moniker": carrier,
      "carrier": {
        "carrier_service": carrier_service,
        "tracking_number": "we33223342400",
        "service_description": carrier_service_description,
        "ship_date": shipDate,
        "origin": {
          "country": oc,
          "zipcode": ozip
        },
        "destination": {
          "country": dc,
          "zipcode": dzip
        },
        "events": [{
          "event_code": "300"
        }]
      },
      "order": {
        "order_date": shipDate
      }
    },
    "debug": "true"
  }

  const response = await fetch(`https://eddapi.narvar.com/${retailer}/2/shipping/edd`, {
    method: 'post',
    body: JSON.stringify(request),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  let responseJson = await response.json();
  return {
    'oc': oc,
    'dc': dc,
    'ozip': ozip,
    'dzip': dzip,
    'edd': responseJson.edd_begin,
    'edd_source': responseJson.edd_source,
    'carrier': carrier,
    'service': carrier_service_description
  };
}