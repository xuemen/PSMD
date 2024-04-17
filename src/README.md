# PSMD tool

- PSMD\src\term.js
~~~
node term 1     : read term.1.yaml, let id = hash(text) and save as term.id.yaml
node term all   : term metada + termset metadata → allterm metadata
node term term id   : term metadata → term markdown + html
node term termset id    ： termset metadata → termset markdown + html
~~~

- PSMD\src\model.js
~~~
node model id    ： COM metadata → COM markdown + html
~~~

- PSMD\src\deploy.js
~~~
node deploy id  ：deploy metadata → deploy markdown、deploy html、全部通过后的COD metdadata
node deploy
~~~