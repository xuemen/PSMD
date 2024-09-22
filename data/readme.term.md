# term and protocol
schema for contract

## UI体验

1. 浏览协议：
    - 全文模式：合并显示所有内容。
    - 提示模式：不同entity浏览角色清单，选择不同角色可以浏览不同的资产、接口、权力分配、利益分配等条文。
1. 签署协议：
    - manifest text：提供最终文本，可以自行打印签名。
    - manifest code：提供元数据、配套代码、配套文档（schema for code）及其数字签名。
1. 执行协议：
    - manifest text：签署各方按照文本协议执行，其他方按照文本协议核实后参与。
    - manifest code：
        - 个人领域manifest text：个人领域以manifest code执行的签署者，向其它签署者提供UI，以菜单、按键等方式显示当前合规行为，并接受结果。
        - 个人领域manifest code：以菜单、按键等方式合并到个人领域的工具中。

* manifest code指的是使用相同schema for code的情形。其它情形先按manifest text模式执行，定制专用工具完成接口对接后再参考manifest code。

## 数据接口

1. 