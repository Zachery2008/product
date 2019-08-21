# Senz-ReProcess
> Source code of reprocess container 

One to two paragraph statement about your product and what it does.

![](header.png)

## Installation

Windows:

1. Install Docker Desktop for Windows at https://docs.docker.com/docker-for-windows/install/.
2. Before you can get access to the image, it is needed to register an account with LifeBooster email, and ask Lawrence add your account to the company and have right to access to repository lifeboostersenz\senz.
3. Pull the suitable image for your purpose due to limitation of network of Windows: running **Windows container** locally for development needs some IP settings(related to host laptop/PC) within container. So make sure to choose the right tag. Open termial(powershell), and run
```sh
docker pull llifeboostersenz/senz:tagname
``` 
Once the download is done, you can see the image at your laptop/PC by 
```sh
docker image ls
``` 
4. Open terminal(powershell), create a container based on the image just being pulled:
```sh
docker run -d -td lifeboostersenz/senz:tagname
```

Now, Matlab reprocess is running on your host!
## Usage 
- **Reach to reprocess from host via http GET request** 

  You can kick off Matlab reprocess by a http GET request with some necessary parameters. The IP address is your container's IP address. You can acquire your container IP address by 
  ```sh
  docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <container-name> 
  ```
  This internal address is the way that host can reach to applications within the container. And the port number is ``` 5000```.
  
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
  Once the container is retarted, its IP address may be changed, you need to re-check the its IP address.
  


## Meta

Zachery Zhu – Zachery.zhu@lifebooster.ca

