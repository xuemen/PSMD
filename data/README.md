# PSMD meta data

1. term定义条款和合同，包括正文、注释、层次结构、次序、修订关系，以及占位符、各级映射。
1. COM定义共同体的模型：placeholder替换成中性词，列出各局部的多种可以互相替换、效果相近的term。各COD的部署和运行经验汇总到COM。
1. deploy定义部署的初始条件、内部词汇和占位符的映射和term逐步生效的过程，期间可以有过渡性的条款或模型。
1. COD定义共同体的实例。实例中出现的error和term汇总到建模者，也可以发布新的COM。
1. error定义有效果偏差的term，以及有效果的term。索引位置暂定在allterm metadata。

## 数据结构

###  term
term定义条款和合同，包括正文、注释、层次结构、次序、修订关系，以及占位符、各级映射。

- 增加item字段。
  - 取消item.path，改由统一的接口从id获得path、obj
  - 取消item.type，统统都有text、term字段，localid都可以在interface转换成空字符串，实现无序号文字。
  - 暂时保留upgradeby字段，实际使用后再定。
- 增加depend、together字段，结合原有的effect字段代替knowledge
  - 默认是termtoerror，因为没有type，而effect的id也是errorid
  - 可能有不止一种效果，每种效果的depend、together不同，这时仍需要独立的knowledge
- interface和map字段都去掉分类，直接排列所有placeholder的映射。
    - placeholder中添加termid，以示区别。

- <term.termid.localid.id>只能用在upgradeby，不能用在map。
- upgradeby的替换优先级是：
  - 上级条款的upgradeby
  - 用localid的本地upgradeby
  - 上级条款的map
  - 用term的本地upgradeby
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
COM定义共同体的模型：placeholder替换成中性词，列出各局部的多种可以互相替换、效果相近的term。各COD的部署和运行经验汇总到COM。

- 主要以权力分配为主线。利益分配、角色任免关系是否需要单独定义，或者建立索引，实际使用后回顾。


```
name:
id:
modeler:
  name:
  id:
  COM:
  IRI: //代替其它字段
interface:
  <term.termid.entity.1>: value
  <term.termid.entity.2>: value
  <term.termid.asset.1>: value
  <term.termid.term.1>: value
  <term.termid.event.1>: value
  <term.termid.localid.1>: value
item:
  level0:
    const: //不可修订条款
      - termid:
        map:
        readme: |
      - termid:
    loop: //自修订条款
      - termid:
        map:
        readme: |
      - termid:
  level1:
    - upgradeby:
      option:
        - termid:
          map:
          readme: |
        - termid:
    - upgradeby: //对于开源信息可以解决的，可以用readme说明而不列出具体term。
      readme:
  level2:
    - upgradeby:
      option:
        - termid:
          map:
          readme: |
        - termid:
```
实际使用：
- loop term要不要有localid。
    - 按修订层次排序应该固化吗，还是其中一种布局。
    - 可互相替换的条款，肯定需要在COM而不是term中表达。
- level0可以去掉，减少一层。
- 可互相替换的条款，序号怎么定，互相引用关系怎么定。
    - leveln.m
- 新的提议：
```
name:
id:
modeler:
  name:
  id:
  COM:
  IRI: //代替其它字段
interface:
  <term.termid.entity.1>: value
  <term.termid.entity.2>: value
  <term.termid.asset.1>: value
  <term.termid.term.1>: value
  <term.termid.event.1>: value
  <term.termid.localid.1>: value
termmaker:
  const: //不可修订条款
    - termid:
      map:
      readme: |
    - termid:
  loop: //自修订条款
    - termid:
      map:
      readme: |
    - termid:
  level1:
    - upgradeby:
      option:
        - termid:
          map:
          readme: |
        - termid:
    - upgradeby: //对于开源信息可以解决的，可以用readme说明而不列出具体term。
      readme:
  level2:
    - upgradeby:
      option:
        - termid:
          map:
          readme: |
        - termid:
termid: // not term maker
```

###  deploy
deploy定义部署的初始条件、内部词汇和占位符的映射和term逐步生效的过程，期间可以有过渡性的条款或模型。

- 部署过程应能自动生成专题讨论。
  - 对外的专题讨论，使用COMinterface替换placeholder。
  - 内部的专题讨论，使用interface替换placeholder。

```
name:
id:
COM:
COMinterface:
  <term.termid.entity.1>: value
  <term.termid.entity.2>: value
  <term.termid.asset.1>: value
  <term.termid.term.1>: value
  <term.termid.event.1>: value
  <term.termid.localid.1>: value
deployer: 
  name:
  id:
  COM:
  IRI: //代替其它字段
interface:
  <term.termid.entity.1>: value
  <term.termid.entity.2>: value
  <term.termid.asset.1>: value
  <term.termid.term.1>: value
  <term.termid.event.1>: value
  <term.termid.localid.1>: value
step:
  - termid:
    y: 
      termid:
      y:
      n:
      case:
        - cod: id
          log: |
          readme: |
      issue: //可以设计编号规则，单独另建专题（文件、文件夹或讨论区）。
        name:
        id:
        path:
      readme: |
        //案例分析，发言素材，讨论推演。
    n: 
      errorid:
      y:
      n:
        readme: |
          deploy failure.
          detail info...
  - errorid:
    y: 
      termid:
      y:
      n:
      case:
        - cod: id
          log: |
          readme: |
      readme: |
readme: |
logpath:
```

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
COD定义共同体的实例。实例中出现的error和term汇总到建模者，也可以发布新的COM。

- 应能自动生成专题讨论：
  - 对外的专题讨论，使用COMinterface替换placeholder。
  - 内部的专题讨论，使用interface替换placeholder。
- 应能自动生成COM的主要信息，发布经验。
```
name:
id:
COM:
deploy:
COMinterface:
  <term.termid.entity.1>: value
  <term.termid.entity.2>: value
  <term.termid.asset.1>: value
  <term.termid.term.1>: value
  <term.termid.event.1>: value
  <term.termid.localid.1>: value
interface:
  <term.termid.entity.1>: value
  <term.termid.entity.2>: value
  <term.termid.asset.1>: value
  <term.termid.term.1>: value
  <term.termid.event.1>: value
  <term.termid.localid.1>: value
termid:
logpath:
```


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
  <error.termid.entity.1>: value
  <error.termid.entity.2>: value
  <error.termid.asset.1>: value
  <error.termid.term.1>: value
  <error.termid.event.1>: value
  <error.termid.localid.1>: value
text: |
readme: |
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
- depend: 部署本条款（解决本error）之前先解决该error
- together：部署本条款（解决本error）的同时开始解决该error
- 解决方案只含一条term或者termset。
- 根据type：objid to effect

### view


```
name:
id:
template:
  txt:
  markdown:
  html:
  ofd:
  tex:
data:
  content:
  email:
  alert: text
  confirm:
    text:
    yes: path or null
    no: path or null
  prompt:
    text:
    defaul:
    pass: 
    fault: path 
```