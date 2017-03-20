iptables -t nat -D PREROUTING -p tcp --dport 80 -j REDIRECT --to 5600
iptables -t nat -D PREROUTING -p tcp --dport 80 -j REDIRECT --to 80
sudo iptables -F
sudo iptables -Z
