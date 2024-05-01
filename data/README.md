# PSMD meta data

1. term定义条款，重点在接口。
1. termset定义条款集，定义条款的次序、接口映射、修订关系。
1. COM定义共同体模型，定义主体termset，并且以error定义可选termset。
1. deploy定义部署的初始条件、接口映射和逐步生效的过程，期间有过渡性的条款或模型。
1. COD定义共同体的现状，要考虑主体、条款的不断修订。
1. error定义有效果偏差的termset、COM，以及有效果的termset、COM。索引位置暂定在allterm metadata。

## 数据结构

###  term

- 增加item字段。
  - 取消item.path，改由统一的接口从id获得path、obj
  - 取消item.type，统统都有text、term字段，localid都可以在interface转换成空字符串，实现无序号文字。
  - 暂时保留upgradeby字段，实际使用后再定。
- 增加depend、together字段，结合原有的effect字段代替knowledge
  - 默认是termtoerror，因为没有type，而effect的id也是errorid
  - 可能有不止一种效果，每种效果的depend、together不同，这时仍需要独立的knowledge
- interface和map字段都去掉分类，直接排列所有placeholder的映射。
    - placeholder中添加termid，以示区别。

~~~
name:
id:
interface:
  <term.termid.entity.1>: value
  <term.termid.entity.2>: value
  <term.termid.asset.1>: value
  <term.termid.term.1>: value
  <term.termid.event.1>: value
  <term.termid.localid.1>: value
item:
  - localid:
    text: |
    termid: 
    upgradeby: // localid.localid.....localid
    map:
      <term.termid.entity.1>: <term.termid.entity.1>
      <term.termid.entity.2>: <term.termid.entity.2>
      <term.termid.asset.1>: <term.termid.asset.1>
      <term.termid.term.1>: <term.termid.term.1>
      <term.termid.event.1>: <term.termid.event.1>
      <term.termid.localid.1>: <term.termid.localid.1>
readme: |
depend:
  - errorid:
    percent:
    map:
        <term.termid.entity.1>: <term.termid.entity.1>
    text: | 
together:
  - errorid:
    percent:
    map:
        <error.errorid.entity.1>: <term.termid.entity.1>
    text: |
effect:
  - errorid:
    percent:
    map:
        <error.errorid.entity.1>: <term.termid.entity.1>
    text: |
~~~

###  COM

~~~
name:
id:
maintermset:    // termsetid 
option:         // 可选的条款
    sortid:     
        type:  // error term termset
        id:    // errorid termid termsetid
        readme: |
readme: |
effect:
~~~

###  deploy

~~~
name:
id:
interface:
  entity:
    id: value
  asset:
    id: value
  term:  //  引用其它条款，在termset、COM中根据联合使用情况绑定。
    id: value
  event:
    id: value
COM:
    sortid: // 部署的次序，逐个部署。例如:自然人部署筹备组COD，筹备组COD部署正式COD。后续COD的部署者deployer可以是前面的sortid。
        type:   // termset or COM
        id: // termsetid or COMid
        map:    // interface 局部-全局映射表
            entity:
                localid: globalid
            asset:
                localid: globalid
            term:  //  引用其它条款，在termset、COM中根据联合使用情况绑定。
                localid: globalid
            event:
                localid: globalid
      path:   // metadata location
        period: // termset或者COM的有效期，在此期间部署下一个COD
        logpath:
readme: |
logpath:
effect:

~~~

### COD

~~~
name:
id:
deployid:   // 也可以在log中体现。
interface:
  entity:
    id: value
  asset:
    id: value
  term:  //  引用其它条款，在termset、COM中根据联合使用情况绑定。
    id: value
  event:
    id: value
item:
    sortid: // item在termset中的排序
      type:  term\termset
      id:     // termid or termsetid
        upgradeby: // sortid.sortid.....id  上级定义覆盖下级定义
        deploy: // 本item部署的记录
            logid:
            date:
            deployer:
        map:    // interface 局部-全局映射表
            entity:
                localid: globalid
            asset:
                localid: globalid
            term:  //  引用其它条款，在termset、COM中根据联合使用情况绑定。
                localid: globalid
            event:
                localid: globalid
      path:   // metadata location
        text:   // 部署后的正式文本，允许和模型有出入。
        readme: |
readme: |
logpath: 
~~~


### env

~~~
name:
id:
term:
  - id:
  - id:
termset:
  - id:
  - id:
error:
  - id
  - id
~~~
- term字段：已经生效的term。如果单独有重要效果的话就列出。
- termset字段：已经生效的termset。如果有效果的term组合被分在termset的不同章节下，如何快速匹配？
- error：目前未解决的error

### error

- error
~~~
name:
id:
interface:
  entity:
    id: value
  asset:
    id: value
  term:
    id: value
  event:
    id: value
text: |
readme: |
bind:
  - type: term、termset、COM、deploy、COD
     id:
~~~

### log
~~~
- id:
- time:
- entityid:
- termsetid:
- termid:
- text: |
~~~
- entity是指cod的interface中id。
- termid是指termset中的sortid/sortid/.../sortid
- 某entity根据某term的行为。

### knowldege / effect

~~~
name:
id:
type:
objid:
depend:
  errorid:
    percent:
    text: | 
together:
  errorid:
    percent:
    text: |
effect:
  id:
    percent:
    text:
readme: |
~~~
- depeng: 部署本条款（解决本error）之前先解决该error
- together：部署本条款（解决本error）的同时开始解决该error
- 解决方案只含一条term或者termset。
- 根据type：objid to effect
