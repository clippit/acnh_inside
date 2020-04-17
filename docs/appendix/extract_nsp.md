# NSP 文件解压

## 准备工具和文件

本文的叙述主要以 macOS 系统为主，其他操作系统用户可以自行调整步骤细节。

### [hactool](https://github.com/SciresM/hactool)

一个处理各种 Nintendo Switch 文件格式的工具，可以用来查看信息、解压缩等。作者提供了 Windows 的预编译二进制程序。在 macOS 下，编译过程也非常简单，参考 README 即可。

### [nstool](https://github.com/jakcron/nstool)

同样也是一个用来处理各种 Nintendo Switch 文件格式的工具，和 hactool 有一些功能重复，但是也有独有的功能，主要用来补充使用。作者提供了三个平台的预编译程序，可以直接去 Github Releases 下载使用。

### prod.keys

NSP 文件都是加密过的，解密的密钥保存在每一台出厂的 Switch 机器中。prod.keys 事实上是一个 Switchbrew 社区内较为通用的纯文本配置文件，大部分常用工具都能支持。为了避免法律风险，本文不会直接提供 prod.keys 的文件内容，不过有两种方法可以帮助到你。

* 第一个方法是去网上自己找别人上传的 prod.keys 文件，风险自担。
* 第二个方法是从自己的 Switch 机器中导出该文件。这种方法要求你的机器能够进入 RCM Mode。详细步骤不属于本文介绍的范畴。简单来说，需要确保 SD 卡里已经有 [Atmosphère](https://github.com/Atmosphere-NX/Atmosphere/releases)，然后启动进入 RCM 模式，将 [Lockpick_RCM](https://github.com/shchmue/Lockpick_RCM/releases) Payload 注入后根据屏幕操作即可。最终 prod.keys 文件会保存到 SD 卡 `/switch/prod.keys` 路径。

无论你使用哪种方法获取到了 prod.keys，可以将它放在 `$HOME/.switch/` 目录下，这样上述两个工具就可以直接读取到它。

### NSP 文件

需要你准备好主体 NSP 和最新版的更新 NSP（如果需要的话）。如何下载这些文件不在本文介绍的范围内。

## 解压步骤

### 解开 NSP 第一层

使用以下命令将 NSP 文件解压到 `unpacked_nsp` 目录中：

```
hactool -i -x -t pfs0 --pfs0dir=unpacked_nsp "nsp文件路径"
```

如果有更新的 NSP 的话，也可以一起解压，换一个 `--pfs0dir` 路径即可。

### 解包 NCA

解出的 NSP 会包含若干个 NCA 文件和一个 XML 文件。这其中最大的那个 NCA 文件往往是我们最关心的。

::: tip NCA 文件
NCA（Nintendo Content Archive）也是一种私有的打包格式，其整个文件也是加密的。每个 NCA 的类型在 XML 中可以看到，其中最核心的是 `Program`，即程序主体，此外常见的还有 `Control`，其中包含 Switch 主界面上显示的应用图标，和 `LegalInformation`。
:::

#### 确定 TitleKey

在解包的目录中，注意有没有 `.tik` 文件。如果有的话，说明这些 NCA 需要使用特定的 TitleKey 来解密，如果没有则无需关心，可以跳过这一段。如果需要 TitleKey，在下文使用 hactool 时，就需要指定 `--titlekey` 参数，该参数的值可以通过 nstool 来获取。

```
nstool -t tik unpacked_nsp\xxxxxxxxxxxxxx.tik
```

注意返回结果中的 `Data` 段，把其中的 `:` 去掉就能构成 hactool 使用的 `--titlekey` 参数的值。例如 `Data` 显示为 `00:01:02:03:04:05:06:07:08:09:0A:0B:0C:0D:0E:0F`，则我们需要 `000102030405060708090A0B0C0D0E0F`。

#### 解包单一 NCA

可以使用如下命令查看 NCA 文件信息：

```
hactool -i unpacked_nsp/xxxxxxxxxxxxxxxx.nca
```

可以看到输出中包含了 Section 信息，一般游戏本体会有一个 Section 0，类型为 ExeFS，和一个 Section 1，类型为 RomFS。使用如下命令将其一起解压：

```
hactool --romfsdir=unpacked_nsp/romfs --exefsdir=unpacked_nsp/exefs  unpacked_nsp/xxxxxxxxxxxxxxxx.nca
```

::: tip ExeFS 和 RomFS
ExeFS 中包含了可执行的程序主体（NSO 类型），RomFS 则是各种资源和配置文件。
:::

#### 将更新 NCA 和本体 NCA 合并一起解包

首先将本体和最新版本的更新都解开，找到所需的 NCA 文件名，然后使用如下命令：

```
hactool -i -x --titlekey 000102030405060708090A0B0C0D0E0F --basenca unpacked_nsp/xxxxxxxxxxxxxxxx.nca --exefsdir unpacked_nsp_update/exefs --romfsdir unpacked_nsp_update/romfs unpacked_nsp_update/xxxxxxxxxxxxxxxx.nca
```

这其中：

* `000102030405060708090A0B0C0D0E0F` 根据情况替换成所需要的 TitleKey
* unpacked_nsp/xxxxxxxxxxxxxxxx.nca 是本体的 Program NCA 路径
* unpacked_nsp_update/xxxxxxxxxxxxxxxx.nca 是更新的 Program NCA 路径

最终，合并后的 ExeFS 和 RomFS 会解压到 unpacked_nsp_update 下面的相应目录中。

## 参考资料

* [Nintendo Switch Digital Software Dumping Guide](https://wiki.no-intro.org/index.php?title=Nintendo_Switch_Digital_Software_Dumping_Guide)