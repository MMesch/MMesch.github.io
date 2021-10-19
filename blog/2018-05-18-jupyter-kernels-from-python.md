---
title: Using Jupyter Kernels From Python
class: post
thumbnail: "/images/thumbnails/Jupyter_logo.svg"
---

This notebook demonstrates how a jupyter kernel can be started and controlled from Python (i.e. another jupyter kernel in this case, with an attached notebook).

## Demonstration of Python - Jupyter kernel interaction

Jupyter provides capabilities to launch a compute kernel in a subprocess that can execute user computations. This notebook demonstrates how this works, using Python to launch and manage the compute kernel.

### Table of Contents

1.  starting a jupyter kernel using the KernelManager class
2.  interactions with the jupyter kernel using the BlockingKernelClient class
3.  sending serialized Python objects to jupyter


### starting a jupyter kernel using the KernelManager class

Jupyter kernels are managed by a KernelManager class. This class is responsible to start, stop and manage a single compute kernel in a subprocess. It can be instantiated with default arguments with:

```python
import jupyter_client
manager = jupyter_client.KernelManager()
manager.is_alive()
```

```
False
```

Until now, this kernel has not been started. A compute kernel can have different properties. For example, it could be a Python2 or Python3, a Haskell kernel or some other exotic specification. Jupyter stores the kernel specifications in a KernelSpec object. Let's have a look at it for the kernel that we have just instantiated:

```python
manager.kernel_spec.to_dict()
```

```
{'argv': ['/home/matto/miniconda3/bin/python',
  '-m',
  'ipykernel_launcher',
  '-f',
  '{connection_file}'],
 'display_name': 'Python 3',
 'env': {},
 'interrupt_mode': 'signal',
 'language': 'python',
 'metadata': {}}
```

This dictionary describes in detail the kernel that the KernelManager manages. In our case, it is a Python3 kernel. Let's start the kernel with the obvious start_kernel() method and check again if it is alive:

```python
manager.start_kernel()
manager.is_alive()
```

```
True
```

The KernelManager provides different methods to extract information about the kernel. Communication with the kernel is done through a message interface (http://jupyter-client.readthedocs.io/en/stable/messaging.html). The ports that are used for these messages can be seen:

```python
manager.get_connection_info()
```

```
{'control_port': 48159,
 'hb_port': 44763,
 'iopub_port': 59763,
 'ip': '127.0.0.1',
 'key': b'2830e36f-86c120ead1c005e5797396c1',
 'shell_port': 41363,
 'signature_scheme': 'hmac-sha256',
 'stdin_port': 51377,
 'transport': 'tcp'}
```

### interactions with the jupyter kernel using the BlockingKernelClient class
Interaction with the kernel is handled by a Client class. We are going to use the default BlockingKernelClient here. Such a client that is connected to the appropriate kernel can be obtained from the manager:

```python
client = manager.client()
client
```

```
jupyter_client.blocking.client.BlockingKernelClient at 0x7fc9643e4550
```

Let's try to communicate with our kernel. We have different channels available. For our purposes the most important one is the iopub channel, that is used to send code and receive results. Checking if the kernel has sent any messages on this channel throws an Empty Exception:

```python
try:
    client.get_iopub_msg(timeout=0)
except Exception as err:
    print('empty queue')
    print(type(err))
```

```
empty queue
class 'queue.Empty'
```

As we would expect, there is no message from the kernel, because we didn't start sending any requests to it so far. A simple computation can be send through the .execute() method:

```python
client.execute('3+2')
```

```
'fea281ed-77987d7a89692479f3c93088'
```

This triggers a cascade of message responses from the jupyter kernel that we can inspect one by one using the `.get_iopub_msg`:

```python
client.get_iopub_msg()
```

```
{'buffers': [],
 'content': {'execution_state': 'starting'},
 'header': {'date': datetime.datetime(2018, 5, 22, 11, 30, 23, 3695, tzinfo=tzutc()),
  'msg_id': '16f7a9a3-7df46aea379ad558a48a8ed9',
  'msg_type': 'status',
  'session': 'c9b86ad9-e4f01c7571f295fe001b9b08',
  'username': 'matto',
  'version': '5.3'},
 'metadata': {},
 'msg_id': '16f7a9a3-7df46aea379ad558a48a8ed9',
 'msg_type': 'status',
 'parent_header': {}}
```

The above message is just telling us that the kernel is now busy with our request ...

```python
client.get_iopub_msg()
```

```
{'buffers': [],
 'content': {'execution_state': 'busy'},
 'header': {'date': datetime.datetime(2018, 5, 22, 11, 30, 23, 4407, tzinfo=tzutc()),
  'msg_id': '9f1441d8-c44ac9476becd84ee0c147b6',
  'msg_type': 'status',
  'session': 'c9b86ad9-e4f01c7571f295fe001b9b08',
  'username': 'matto',
  'version': '5.3'},
 'metadata': {},
 'msg_id': '9f1441d8-c44ac9476becd84ee0c147b6',
 'msg_type': 'status',
 'parent_header': {'date': datetime.datetime(2018, 5, 22, 11, 30, 22, 363864, tzinfo=tzutc()),
  'msg_id': 'fea281ed-77987d7a89692479f3c93088',
  'msg_type': 'execute_request',
  'session': 'af27da15-a5a7241d50cd60c5d20a783e',
  'username': 'matto',
  'version': '5.3'}}
```

the next message shows the statement '3+2' that is executed on the kernel

```python
client.get_iopub_msg()
```

```
{'buffers': [],
 'content': {'code': '3+2', 'execution_count': 1},
 'header': {'date': datetime.datetime(2018, 5, 22, 11, 30, 23, 4612, tzinfo=tzutc()),
  'msg_id': '7a9c3f88-df5b892f6f5760c47fa31428',
  'msg_type': 'execute_input',
  'session': 'c9b86ad9-e4f01c7571f295fe001b9b08',
  'username': 'matto',
  'version': '5.3'},
 'metadata': {},
 'msg_id': '7a9c3f88-df5b892f6f5760c47fa31428',
 'msg_type': 'execute_input',
 'parent_header': {'date': datetime.datetime(2018, 5, 22, 11, 30, 22, 363864, tzinfo=tzutc()),
  'msg_id': 'fea281ed-77987d7a89692479f3c93088',
  'msg_type': 'execute_request',
  'session': 'af27da15-a5a7241d50cd60c5d20a783e',
  'username': 'matto',
  'version': '5.3'}}
```

after code execution, a return value (stored in 'content': {'data': ....}') is sent to the client

```python
client.get_iopub_msg()
```

```
{'buffers': [],
 'content': {'data': {'text/plain': '5'},
  'execution_count': 1,
  'metadata': {}},
 'header': {'date': datetime.datetime(2018, 5, 22, 11, 30, 23, 6003, tzinfo=tzutc()),
  'msg_id': '28b19685-167db8d658ce45f6f17b88cb',
  'msg_type': 'execute_result',
  'session': 'c9b86ad9-e4f01c7571f295fe001b9b08',
  'username': 'matto',
  'version': '5.3'},
 'metadata': {},
 'msg_id': '28b19685-167db8d658ce45f6f17b88cb',
 'msg_type': 'execute_result',
 'parent_header': {'date': datetime.datetime(2018, 5, 22, 11, 30, 22, 363864, tzinfo=tzutc()),
  'msg_id': 'fea281ed-77987d7a89692479f3c93088',
  'msg_type': 'execute_request',
  'session': 'af27da15-a5a7241d50cd60c5d20a783e',
  'username': 'matto',
  'version': '5.3'}}
```

finally, the kernel goes back into idle mode again, and this is the end of the messages that follow a single execution, as can be seen by checking:

```python
try:
    client.get_iopub_msg(timeout=0)
except Exception as err:
    print('empty queue')
    print(type(err))
```

All of this can be done in a much compressed and safer form using the .execute_interactive() method that immediately returns the results:

```python
client.execute_interactive('3+2')
```

```
5
{'buffers': [],
 'content': {'execution_count': 2,
  'payload': [],
  'status': 'ok',
  'user_expressions': {}},
 'header': {'date': datetime.datetime(2018, 5, 22, 11, 30, 23, 46009, tzinfo=tzutc()),
  'msg_id': '8aa270e2-b9cd67c9971a398ae45d91ca',
  'msg_type': 'execute_reply',
  'session': 'c9b86ad9-e4f01c7571f295fe001b9b08',
  'username': 'matto',
  'version': '5.3'},
 'metadata': {'dependencies_met': True,
  'engine': '7adc130c-cb3c-4783-bdf4-2e0eaf5015b3',
  'started': '2018-05-22T11:30:23.042660Z',
  'status': 'ok'},
 'msg_id': '8aa270e2-b9cd67c9971a398ae45d91ca',
 'msg_type': 'execute_reply',
 'parent_header': {'date': datetime.datetime(2018, 5, 22, 11, 30, 23, 41239, tzinfo=tzutc()),
  'msg_id': 'e649c9ff-d66ab94382f2621896b3c30c',
  'msg_type': 'execute_request',
  'session': 'af27da15-a5a7241d50cd60c5d20a783e',
  'username': 'matto',
  'version': '5.3'}}
```

```python
manager.shutdown_kernel()
```

### sending serialized Python objects to jupyter

Python objects can be serialized and send as a byte string to a jupyter kernel through the message interface. Python provides the pickle library to serialize objects. The following cells demonstrate how this can be done. First we open a kernel with a specific ID name:

```python
manager = jupyter_client.KernelManager(connection_file='mykernel.json')
manager.start_kernel()
manager.is_alive()
```

```
True
```

we can connect to this kernel with an external console using jupyter console --existing mykernel.json. We are now going to send a serialized Python dictionary object to this kernel:

```python
import pickle
client = manager.client()
dictionary = {'a': 5, 'b': 3}
client.execute('import pickle')
client.execute_interactive('a=pickle.loads({})'.format(pickle.dumps(dictionary)), timeout=100)
```

```
Out[17]:
{'buffers': [],
 'content': {'execution_count': 2,
  'payload': [],
  'status': 'ok',
  'user_expressions': {}},
 'header': {'date': datetime.datetime(2018, 5, 22, 11, 30, 24, 121976, tzinfo=tzutc()),
  'msg_id': '45835c44-99384663671faf70ee518a9c',
  'msg_type': 'execute_reply',
  'session': 'bd6fdd1a-05b8e7149cae8fb4d6c8dc6d',
  'username': 'matto',
  'version': '5.3'},
 'metadata': {'dependencies_met': True,
  'engine': 'a20e8588-fc8d-4e5e-ba30-fe9fb1f943e0',
  'started': '2018-05-22T11:30:24.115847Z',
  'status': 'ok'},
 'msg_id': '45835c44-99384663671faf70ee518a9c',
 'msg_type': 'execute_reply',
 'parent_header': {'date': datetime.datetime(2018, 5, 22, 11, 30, 23, 408879, tzinfo=tzutc()),
  'msg_id': 'bd2a0eb5-f81c8f423d76dced76ab4a9b',
  'msg_type': 'execute_request',
  'session': 'a4202442-1a62d25bf330ab9810b861e1',
  'username': 'matto',
  'version': '5.3'}}
```

typing a in the external jupyter console should now show the dictionary. We can also retrieve it's content through the message interface:

```python
result = client.execute_interactive('a', timeout=100)
```

```
{'a': 5, 'b': 3}
```

even though we store the results of this command in result, we see a line Out[5] which is the actual output line of the jupyter kernel.

```python
manager.shutdown_kernel()
manager.is_alive()
```

```
False
```
