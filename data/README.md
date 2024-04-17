# PSMD meta data

1. term定义条款，重点在接口。
1. termset定义条款集，定义条款的次序、接口映射、修订关系。
1. COM定义共同体模型，定义主体termset，并且以error定义可选termset。
1. deploy定义部署的初始条件、接口映射和逐步生效的过程，期间有过渡性的条款或模型。
1. COD定义共同体的现状，要考虑主体、条款的不断修订。
1. error定义有效果偏差的termset、COM，以及有效果的termset、COM。索引位置暂定在allterm metadata。

- term
~~~
name:
id:
interface:
  entity:
    - name:
    id:
    readme: |
    - name:
    id:
    readme: |
  asset:
    - name:
    id:
    readme: |
  term:  //  引用其它条款，在termset、COM中根据联合使用情况绑定。
    - name:
    id:
    readme: |
  event:
    - name:
      id:
      readme: |
text: |
readme: |
effect: |
~~~

- termset
~~~
name:
id:
level:
interface:
  entity:
    - name:
    id:
    readme: |
    - name:
    id:
    readme: |
  asset:
    - name:
    id:
    readme: |
  term:  //  引用其它条款，在termset、COM中根据联合使用情况绑定。
    - name:
    id:
    readme: |
  event:
    - name:
      id:
      readme: |
item:
    sortid: // item在termset中的排序
      type:  term\termset
      id:     // termid or termsetid
        upgradeby: // sortid.sortid.....id  上级定义覆盖下级定义
        map:    // interface 局部-全局映射表
            entity:
                - globalid:
                localid:
                readme: |
            asset:
                - globalid:
                localid:
                readme: |
            term:  //  引用其它条款，在termset、COM中根据联合使用情况绑定。
                - globalid:
                localid:
                readme: |
            event:
                - globalid:
                localid:
                readme: |
      path:   // metadata location
readme: |
effect: |
~~~

- COM
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

- deploy
~~~
name:
id:
interface:
  entity:
    - name:
    id:
    readme: |
    - name:
    id:
    readme: |
  asset:
    - name:
    id:
    readme: |
  term:  //  引用其它条款，在termset、COM中根据联合使用情况绑定。
    - name:
    id:
    readme: |
  event:
    - name:
      id:
      readme: |
COM:
    sortid: // 部署的次序，逐个部署。例如:自然人部署筹备组COD，筹备组COD部署正式COD。后续COD的部署者deployer可以是前面的sortid。
        type:   // termset or COM
        id: // termsetid or COMid
        map:
            entity:     // 考虑同一个主体在不同条款处于不同位置，身兼多职或变化身份。
                - globalid:
                localid:
                readme: |
            asset:
                - globalid:
                localid:
                readme: |
            term:  //  引用其它条款，在termset、COM中根据联合使用情况绑定。
                - globalid:
                localid:
                readme: |
            event:
                - globalid:
                localid:
                readme: |
      path:   // metadata location
        period: // termset或者COM的有效期，在此期间部署下一个COD
        logpath:
readme: |
logpath:
effect:

~~~

- COD
~~~
name:
id:
deployid:   // 也可以在log中体现。
interface:
  entity:
    - name:
    id:
    readme: |
    - name:
    id:
    readme: |
  asset:
    - name:
    id:
    readme: |
  term:  //  引用其它条款，在termset、COM中根据联合使用情况绑定。
    - name:
    id:
    readme: |
  event:
    - name:
      id:
      readme: |
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
                - globalid:
                localid:
                readme: |
            asset:
                - globalid:
                localid:
                readme: |
            term:  //  引用其它条款，在termset、COM中根据联合使用情况绑定。
                - globalid:
                localid:
                readme: |
            event:
                - globalid:
                localid:
                readme: |
      path:   // metadata location
        text:   // 部署后的正式文本，允许和模型有出入。
        readme: |
readme: |
logpath: 
~~~

- error
~~~
name:
id:
text: |
readme: |
bind:
  - type: term、termset、COM、deploy、COD
  - id:
~~~