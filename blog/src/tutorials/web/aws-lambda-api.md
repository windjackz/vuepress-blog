---
title: AWS Lambda + API Gateway + DynamoDB 实战
icon: article
description: 本文主要实践AWS Lambda + API Gateway + DynamoDB的组合使用。
category:
  - 教程
tag:
  - web
star: false
---

在[AWS Serverless搭建Tensorflow/TFlite推理服务](/tutorials/machine-learning/aws-lambda-tflite.html)一文中，我们成功创建了一个基于tensorflow的推理服务。为了能把服务真正地用起来，我们还需提供对外访问的http api接口，以及访问数据库的能力。这就轮到API Gateway以及DynamoDB出场了。

## 使用SAM CLI快速创建应用模版 

SAM(AWS 无服务器应用程序模型)是一个用于构建Serverless应用的开源框架。SAM CLI 是SAM的命令行工具。关于它们更详细的介绍及安装方式在[实战1-利用sam-cli在aws-lambda上部署tensorflow](/tutorials/web/aws-lambda-api.html#实战1-利用sam-cli在aws-lambda上部署tensorflow)一文中已经提到过了，这里不过多介绍。

首先我们通过sam init 命令初始化一个包含AWS Lambda、API Gateway、DynamoDB资源的应用模版。

- 输入sam init ，选择"AWS Quick Start Templates"
- 询问选择的模版，选择"Serverless API"
- 询问选择的runtime，这里选择nodejs16.x
- 询问是否使用X-Ray追踪应用性能，选择y
- 输入project name

完成后我们将有一个quick start的模版

```
    -----------------------
    Generating application:
    -----------------------
    Name: sam-app
    Runtime: nodejs16.x
    Architectures: x86_64
    Dependency Manager: npm
    Application Template: quick-start-web
    Output Directory: .
    
    Next steps can be found in the README file at ./sam-app/README.md
```


## SAM template.yaml 模版剖析

进入到我们sam init 的目录，可以看到有如下结构：

```
- `src` - Lambda云函数代码目录
- `events` - 可用于调用函数的调用事件。
- `__tests__` - 单元测试目录
- `template.yaml` - 定义应用程序的AWS 资源的模版.
```

我们先来查看yaml文件。template.yaml文件是SAM模版，SAM模版基于CloudFormation模版，CloudFormation模版用来描述AWS资源以及属性，这将作为构建AWS资源的蓝图。在此基础上，SAM模版引入了几种新的资源和属性类型，它们可以嵌入到模板的资源部分。

为了让CloudFormation识别SAM定义的对象，必须在模版的Transform字段中包含值"AWS::Serverless-2016-10-31"

因此在yaml文件中，我们可以看到以下内容：

```yaml
AWSTemplateFormatVersion: 2010-09-09
Transform:
- AWS::Serverless-2016-10-31
```

在模版中，必须至少声明一个Resources对象，它包含资源对象的列表。资源对象必须有一个Type属性，它指定了要创建的AWS资源的种类。Type属性的格式如下：
```
AWS::ProductIdentifier::ResourceType
```

Resources的组成如下：
```yaml
Resources:
  Logical ID:
    Type: Resource type
    Properties:
      Set of properties

```

现在我们查看template.yaml中的Resources部分，其中声明了4个资源，3个是云函数，1个是文档数据库DynamoDB。

数据库的声明比较简单：
```yaml
Resources:
  SampleTable:
    Type: AWS::Serverless::SimpleTable
    Properties:
      PrimaryKey:
        Name: id
        Type: String
      ProvisionedThroughput:
        ReadCapacityUnits: 2
        WriteCapacityUnits: 2
```

这里声明了一个具有单个属性主键的DynamoDB表。它通常用于之需要通过主键访问数据的情景。PrimaryKey定义了表的主键名称和类型。ProvisionedThroughput则定义了预置的吞吐量。这里读与写都设置了2个单位。关于单位的详细说明可以看[这里](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadWriteCapacityMode.html)。

接着再来看云函数的声明：
```yaml
  # This is a Lambda function config associated with the source code: put-item.js
  putItemFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/put-item.putItemHandler
      Runtime: nodejs16.x
      Architectures:
        - x86_64
      MemorySize: 128
      Timeout: 100
      Description: A simple example includes a HTTP post method to add one item to a DynamoDB table.
      Policies:
        # Give Create/Read/Update/Delete Permissions to the SampleTable
        - DynamoDBCrudPolicy:
            TableName: !Ref SampleTable
      Environment:
        Variables:
          # Make table name accessible as environment variable from function code during execution
          SAMPLE_TABLE: !Ref SampleTable
      Events:
        Api:
          Type: Api
          Properties:
            Path: /
            Method: POST
  # Simple syntax to create a DynamoDB table with a single attribute primary key, more in
  # https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlesssimpletable
```
这里声明了一个逻辑ID为putItemFunction的云函数。看描述可知主要用途是通过Http的post方法，向数据库插入一条数据。

Properties字段下的Handler字段表明了云函数的入口位置，该云函数位于在src/handlers目录下的put-item.js文件，入口函数为该文件的putItemHandler方法。
其他字段表示了代码的执行环境为nodejs16.x；运行为台为x86_64；最大分配128MB的内存，超时时间为100秒。

Policies定义了拥有SampleTable表CRUD的权限，Environment里定义了环境变量，在Nodojs中可以通过

```javascript
process.env.SAMPLE_TABLE;
```
来访问。

 !Ref 是模版定义好的内部函数，可以用于返回资源的值。这里返回的是表的资源名称。默认情况下，AWS CloudFormation 生成一个唯一的物理 ID 来命名资源。例如，CloudFormation 可能会使用以下物理 ID "stack123123123123-s3bucket-abcdefghijk1" 命名 Amazon S3 存储桶。

最后再看Events字段，该字段用Map数据结构储存了一组字符串(string)到事件源对象(Events source object)的映射。用来定义触发此云函数的方式。

事件源对象用来描述触发函数的事件源的对象，包含Type以及Properties子弹。Type用来表示事件的类型，它可以是' S3 '、' SNS '、' Kinesis '、' MSK '、DynamoDB '、' SQS '、' Api '、' Schedule '、' CloudWatchEvent '、' CloudWatchLogs '、' IoTRule '、' AlexaSkill '事件之一。

在本例中，事件类型都是'Api',表示触发的方式是通过API 网关(API Gateway)。此时Properties字段中Path以及Method字段是必须的。

- Path 表示访问此云函数的Uri地址。必须以/开头。
- Method 表示访问此云函数的HTTP method，如POST。 

在本例中，我们没有显式地创建AWS::Serverless::Api资源,而是在云函数的事件源中通过Type为Api隐式地创建。此时云函数的输入和输出表示HTTP请求和HTTP响应。例如，使用Javascript API,状态码和body可以通过返回一个带有key为statusCode以及body的对象。

要注意的是，如果显示地定义了AWS::Serverless::Api资源，则Path以及Mathod必须与显式创建时OpenAPI中的操作相符。这里就不展开讨论了。

template中的Globals部分，用于定义云函数和API的通用属性。所有AWS:Serverless:Function和AWS:serverless:Api资源都将继承此处的属性。

```yaml
Globals:
  Function:
    Tracing: Active
  Api:
    TracingEnabled: True
```

本例中Globals主要对应我们sam init时，选择的X-Ray跟踪开启操作。

template中的Outputs部分可以定义在控制台中的输出值。这里将会输出api网关的http地址。

至此，template.yaml 模版文件分析完毕。

## SAM 部署模版应用

接下来我们部署这个模版应用。

首先执行以下命令：
```
sam build
```

若成功将会返回：

```
Build Succeeded

Built Artifacts  : .aws-sam/build
Built Template   : .aws-sam/build/template.yaml

Commands you can use next
=========================
[*] Validate SAM template: sam validate
[*] Invoke Function: sam local invoke
[*] Test Function in the Cloud: sam sync --stack-name {{stack-name}} --watch
[*] Deploy: sam deploy --guided
```
然后执行：

```
sam deploy --guided
```
根据引导回答问题：
```
Setting default arguments for 'sam deploy'
=========================================
Stack Name [sam-app]: 
AWS Region [ap-northeast-1]: 
#Shows you resources changes to be deployed and require a 'Y' to initiate deploy
Confirm changes before deploy [y/N]: y
#SAM needs permission to be able to create roles to connect to the resources in your template
Allow SAM CLI IAM role creation [Y/n]: y
#Preserves the state of previously provisioned resources when an operation fails
Disable rollback [y/N]: y
getAllItemsFunction may not have authorization defined, Is this okay? [y/N]: y
getByIdFunction may not have authorization defined, Is this okay? [y/N]: y
putItemFunction may not have authorization defined, Is this okay? [y/N]: y
Save arguments to configuration file [Y/n]: y
SAM configuration file [samconfig.toml]: 
SAM configuration environment [default]: 

...

Deploy this changeset? [y/N]: y
```

成功后，我们将会看到如下输出：

```
CloudFormation outputs from deployed stack
--------------------------------------------------------------------------------------------------------------------------------------------------------
Outputs                                                                                                                                                
--------------------------------------------------------------------------------------------------------------------------------------------------------
Key                 WebEndpoint                                                                                                                        
Description         API Gateway endpoint URL for Prod stage                                                                                            
Value               https://********.execute-api.ap-northeast-1.amazonaws.com/Prod/                  
```

这对应template.yaml文件中，Outpus部分的定义。

现在我们登录AWS 控制台，别分进入Lambda、API gateway、DynamoDB，可以看到相关的资源都已被创建。

## Lambda Nodejs 操作 DynamoDB

这一节主要分析我们模板创建的云函数代码，了解Lambda云函数如何与DynamoDB数据库交互。

查看package.json的dependencies依赖项，可知主要依赖了aws-sdk。这是AWS提供的开发工具包，可以用它调用各种Amazon Web Services。

![sdk-overview-v3](/assets/images/aws-lambda-api/sdk-overview-v3.png)

先来看src/handlers/put-item.js的源码：

```javascript
// Create clients and set shared const values outside of the handler.

// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
exports.putItemHandler = async (event) => {
  if (event.httpMethod !== 'POST') {
    throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
  }
  // All log statements are written to CloudWatch
  console.info('received:', event);

  // Get id and name from the body of the request
  const body = JSON.parse(event.body);
  const { id } = body;
  const { name } = body;

  // Creates a new item, or replaces an old item with a new item
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
  let response = {};

  try {
    const params = {
      TableName: tableName,
      Item: { id, name },
    };

    const result = await docClient.put(params).promise();

    response = {
      statusCode: 200,
      body: JSON.stringify(body),
    };
  } catch (ResourceNotFoundException) {
    response = {
      statusCode: 404,
      body: 'Unable to call DynamoDB. Table resource not found.',
    };
  }

  // All log statements are written to CloudWatch
  console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
};
```
上述代码通过aws-sdk/clients/dynamodb工具类，向数据库插入了一条{id, name}的数据。留意put方法的参数：

- TableName 表名
- Item 可序列化的 JavaScript 对象。

在上一节中，我们已经部署了应用。若我们在命令行中输入(把********换成你的地址)：

```
curl -XPOST "https://********.execute-api.ap-northeast-1.amazonaws.com/Prod/" -d '{"id": "1","name": "test"}
```

此时在AWS dynamodb 中可以查到如下数据： 

|id|name|
|  ----  | ----  |
|1|test|


读取数据库部分与上述代码类似，核心部分如下：

```javascript
// Get id from pathParameters from APIGateway because of `/{id}` at template.yaml
  const { id } = event.pathParameters;

  // Get the item from the table
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#get-property
  let response = {};

  try {
    const params = {
      TableName: tableName,
      Key: { id },
    };
    const data = await docClient.get(params).promise();
    const item = data.Item;

    response = {
      statusCode: 200,
      body: JSON.stringify(item),
    };
  } catch (ResourceNotFoundException) {
    response = {
      statusCode: 404,
      body: 'Unable to call DynamoDB. Table resource not found.',
    };
  }
```
更对关于数据库的操作，可以查看[适用于 JavaScript 的 AWS 开发工具包](#r4)。

## 参考

[1]: <a name="r1">[AWS Serverless Application Model (SAM)](https://github.com/aws/serverless-application-model/blob/master/versions/2016-10-31.md#resource-types)</a>

[2]: <a name="r2">[resources-section-structure](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/resources-section-structure.html)</a>

[3]: <a name="r3">[intrinsic-function-reference-ref](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-ref.html)</a>

[4]: <a name="r4">[适用于 JavaScript 的 AWS 开发工具包](https://aws.amazon.com/cn/sdk-for-javascript/)</a>
