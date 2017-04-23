# adding dates to each record
IN mongo shell run: `db.businesses.update( {}, {$set: {createdAt: new Date()}},{multi: true});`
# Got Error on URL
Add back url field and set it to github profile
Run `db.businesses.update( {}, {$set: {url: 'https://github.com/idkjs'}},{multi: true});`

# Mutations Where not persisting
Add back likesCount field to business object
Run in mongo shell: `db.businesses.update( {}, {$set: {likesCount: 0}},{multi: true});`
Still not updating from mutation. If run `> db.businesses.updateOne({ name: "Taco Bell" }, { $inc: { likesCount: 1 }})`
from mongoshell the record updates. If refresh in browser, it updates. Its not updating from the mutation, though.
And the mutation isnt updating the record. 

# Running
In terminal start mongodb `mongod`.
In another terminal `webpack -d` then `npm start`
