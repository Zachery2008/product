# Senz-ReProcess
> Source code of reprocess container 

## Prerequisite 
1. Install Docker Desktop for Windows at https://docs.docker.com/docker-for-windows/install/.
2. Before you can get access to the image, it is needed to register an account with LifeBooster email, and ask Lawrence add your account to the company and have right to access to repository lifeboostersenz\senz.

## Installation
On Docker Hub repository lifeboostersenz\senz, you can see all images with tags. 

1. Pull the base image with matlab runtime and nodejs installed:
```sh
docker pull llifeboostersenz/senz:runtimev96-node12.8.0
``` 
Once the download is done, you can see the image at your laptop/PC by 
```sh
docker image ls
``` 
2. Pull this repository to your local host. Then open terminal(powershell), find the internal IP address of the host(laptop) by: create a container based on the image just being pulled:
```sh
ipconfig
```

3. You can see the IPv4 Address that starts with 172.... in the Enthernet, replace this value to config.hostIP which is in /ReprocessV1/config.js. This IP address is the way that container reaches to your host.

4. Build the Reprocess image by running the Dockerfile in terminal: 
```sh
docker build -t reprocess:v1 .
````

5. Construct the reprocess container:
```sh
docker run -d -td reprocess:v1
```

Now, Matlab reprocess is running on your host! 
### Notice: Due to Windows NAT rule, everytime your restart/start your laptop, you need to build your reprocess image from step 3. Remember to remove previous reprocess images and containers that you built before you build your new reprocess image.  

## Usage 
- **Reach to reprocess from host via http GET request** 

  You can kick off Matlab reprocess by a http GET request with some necessary parameters. The IP address is your container's IP address. You can acquire your container IP address by 
  ```sh
  docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <container-name> 
  ```
  This internal address is the way that host can reach to applications within the container. And the port number for matlab reprocess is ``` 5000```.
  
   **Required parameters**:
      
     - captureID
      
     - containerID
      
   **Optional parameters**:
    
     - startTimeIdx
      
     - endTimeIdx
      
     - command 
  
  **Http request format**:
  ```sh
  http://<your container IP>:5000/reprocess?<parameters>
  ```
  
  ***Example***:
  ```sh
  http://172.29.182.47:5000/reprocess?captureID=145807F3-9D2F-4699-BAEE-00332342F700&containerID=test&companyID=46c613b2-821d-4fe4-a57f-4c2c77141d11&startTimeIdx=10&endTimeIdx=2000
  ```
## Stop container
  
  You can stop matlab reprocess service by stop the container:
  ```sh
  docker stop <container-name>
  ```
  To restart the container:
  ```sh
  docker start <container-name>
  ```
  Once the container is restarted, its IP address may be changed, you need to re-check the its IP address.
  


## Meta

Zachery Zhu – Zachery.zhu@lifebooster.ca

