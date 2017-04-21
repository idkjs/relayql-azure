# adding dates to each record
IN mongo shell run: `db.businesses.update( {}, {$set: {createdAt: new Date()}},{multi: true});`
# Got Error on URL
Add back url field and set it to github profile
Run `db.businesses.update( {}, {$set: {url: 'https://github.com/idkjs'}},{multi: true});`
