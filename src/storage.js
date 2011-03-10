;(function (ρ) {

   var uid_counter = 0;

   function genUId(obj) {
      function toPrettyName(num) {
         var abc = ['bcdfghklmnpqrstvwxz', 'aeijouy'], ai = 0, out = ''
         while (num / abc[ai].length > 1) {
            out += abc[ai][num % abc[ai].length]
            num = Math.floor(num / abc[ai].length)
            ai = (ai == 1 ? 0 : 1)
         }
         return out
      }

      uid_counter++;

      return toPrettyName((new Date).getTime()) +
            toPrettyName(100000+uid_counter) +
            toPrettyName(Math.floor(Math.random()*10))
   }

   function list (dict) {
      var i, out = []
      for (i in dict)
         if (dict.hasOwnProperty(i))
            out.push(dict[i])
      return out
   }


   function make () {

      var indices = {}

      function updateIndex (ind, doc) {
         var key = ind.getkey(doc)
         if (key === undefined)
            return
         if (!ind.keys[key])
            ind.keys[key] = {}
         ind.keys[key][doc._id] = doc
      }

      function mkIndex (name, k) {
         indices[name] = {getkey:k, keys:{}}
      }

      function save (doc) {
         doc._id = doc._id || genUId()
         for (idx in indices)
            updateIndex(indices[idx], doc)
      }

      function idx (name) {
         return indices[name] ? list(indices[name]) : []
      }

      mkIndex('*', function (obj) { return obj._id })

      return {
         save: save,
         get: idx,
         index: mkIndex
      }
   }

   var storages = {}

   ρ.storage = function (name) {
	  if (!storages[name]) 
		 storages[name] = make(name)
	  return storages[name]
   }

})(penochka);