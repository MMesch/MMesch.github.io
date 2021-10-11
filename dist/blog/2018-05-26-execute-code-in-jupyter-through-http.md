---
title: Execute Code in Jupyter Kernels Through HTTP Requests and Websockets
class: post
thumbnail: "/images/thumbnails/Jupyter_logo.svg"
---
My last post demonstrated how to interact directly with a Jupyter kernel via the <i>jupyter_client</i> python module. Communication was done via the ZeroMQ messaging protocoll through a number of specific ports.
As soon as we want to communicate with the kernel via a web application, as for example the jupyter notebook app does, there is a simpler way that exposes the communication API as http endpoints and websocket connections.
Any client website or webserver can then directly talk to a jupyter kernel.
The jupyter application that provides this API is a tornado server called <a href="https://github.com/jupyter/kernel_gateway">kernelgateway</a> that can -for our purposes- be thought of as a jupyter notebook without the notebook client itself.
The kernelgateway can be installed with `conda install -c conda-forge jupyter_kernel_gateway` or `pip install jupyter_kernel_gateway`. <br />

The default API of the kernelgateway can be found here (<a href="https://github.com/jupyter/kernel_gateway/blob/master/kernel_gateway/jupyter_websocket/swagger.yaml">swagger.yaml</a>).
It is possible to add your own custom API to the preexisting one (this is for another blogpost).

### Starting Kernels via Bash and Curl

The API can be explored with this bash snippet that (a) starts a kernelgateway, (b) starts a new kernel via a POST message, (c) get's a list of running kernels via a GET request:

<script src="https://gist.github.com/MMesch/24bb44132957f78001d25287255c9648.js"></script>

When executed, this produces:

```bash
[...]/kernel_gateway_test$ ./run.sh 

==== START GATEWAY ====
[KernelGatewayApp] Jupyter Kernel Gateway at http://127.0.0.1:8888

==== PING GATEWAY API ====
{"version": "5.4.0"}[I 180526 11:02:10 web:2064] 200 GET /api (127.0.0.1) 1.40ms

==== START KERNEL ====
[KernelGatewayApp] Kernel started: 4d427307-10cb-44e8-a2ae-54dbd47fe05d
{"id": "4d427307-10cb-44e8-a2ae-54dbd47fe05d", "name": "python3", "last_activity": "2018-05-26T09:02:10.639301Z", "execution_state": "starting", "connections": 0}[I 180526 11:02:10 web:2064] 201 POST /api/kernels (127.0.0.1) 456.17ms

==== GET LIST OF RUNNING KERNELS ====
[{"id": "4d427307-10cb-44e8-a2ae-54dbd47fe05d", "name": "python3", "last_activity": "2018-05-26T09:02:10.639301Z", "execution_state": "starting", "connections": 0}][I 180526 11:02:10 web:2064] 200 GET /api/kernels (127.0.0.1) 0.59ms

==== ALL DONE ====
[KernelGatewayApp] Received signal to terminate.
Terminated
[KernelGatewayApp] Kernel shutdown: 4d427307-10cb-44e8-a2ae-54dbd47fe05d
```

### Starting Kernels and Executing Code via Websockets and Python aiohttp

The same communication API can be used from Python with the aiohttp module and asynchronous http requests.
Additionally we can connect the aiohttp client to the gateway via a websocket (ws).
The websocket connection opens a channel directly to the kernel through which we can send messages such as execute requests, and receive messages from the kernel such as execute results.
This is demonstrated in this script (output below).
When executing the kernel gateway in terminal1 and the above script in terminal2, this produces:

<script src="https://gist.github.com/MMesch/1647615e2e046648a5cac262836e58f8.js"></script>

```bash
terminal1$  /gateway_aiohttp/jupyter kernelgateway --JupyterWebsocketPersonality.list_kernels=True

[KernelGatewayApp] Jupyter Kernel Gateway at http://127.0.0.1:8888
[I 180526 .... web:2064] 200 GET /api/kernels (127.0.0.1) 0.78ms
[KernelGatewayApp] Kernel started: 16582749-b11e-4868-930f-7bb76ae10c96
[I 180526 .... web:2064] 201 POST /api/kernels (127.0.0.1) 427.41ms
[KernelGatewayApp] WARNING | No session ID specified
[KernelGatewayApp] Adapting to protocol v5.1 for kernel 16582749-b11e-4868-930f-7bb76ae10c96
[I 180526 .... web:2064] 101 GET /api/kernels/16582749-b11e-4868-930f-7bb76ae10c96/channels (127.0.0.1) 621.36ms
[KernelGatewayApp] Starting buffering for 16582749-b11e-4868-930f-7bb76ae10c96:1c08d7b3-97f4656534aede0cd4ddb32a
^C[KernelGatewayApp] Interrupted...
[KernelGatewayApp] Kernel shutdown: 16582749-b11e-4868-930f-7bb76ae10c96


terminal2$ /gateway_aiohttp/python gateway_websocket.py

==== start or get kernel ====
get kernel list from:  http://localhost:8888/api/kernels
no kernel exists
starting new kernel 16582749-b11e-4868-930f-7bb76ae10c96

==== start communication ====

---- sending ----

{'header': {'username': '', 'version': '5.0', 'session': '', 'msg_id': '99bd09c585284c3f8f5e7ce1310d698b', 'msg_type': 'execute_request'}, 'parent_header': {}, 'channel': 'shell', 'content': {'code': '2+3', 'silent': False, 'store_history': False, 'user_expressions': {}, 'allow_stdin': False}, 'metadata': {}, 'buffers': {}}

---- receiving ----

< msg type: status >
{'execution_state': 'busy'}
< msg type: execute_input >
{'code': '2+3', 'execution_count': 1}
< msg type: execute_result >
{'data': {'text/plain': '5'}, 'metadata': {}, 'execution_count': 1}
< msg type: execute_reply >
{'status': 'ok', 'execution_count': 0, 'user_expressions': {}, 'payload': []}
< msg type: status >
{'execution_state': 'idle'}
```

We are sending a single execute message to the kernel and it responds with a cascade of messages that can be summarized as:

1. status -> busy
2. execute_input -> code: '2+3'
3. execute_result -> data: '5'
4. execute_reply -> status: ok
5. status -> idle

This corresponds to the standard jupyter messaging protocol (<a href="http://jupyter-client.readthedocs.io/en/stable/messaging.html" target="_blank">see details</a>).
