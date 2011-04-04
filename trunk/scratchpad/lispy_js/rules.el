(if  (REQ= "PAYTYPE" "1")   
     (begin
       (SHOW "SCRCODE")
       (HIDE "BCN"  "BCCVV")
       (MANDATORY "SCRCODE")
     )
) 

(if
  (REQ= "PAYTYPE" "2")
  (begin
    (SHOW  "BCN"  "BCCVV")
    (HIDE  "SCRCODE"  )
    (MANDATORY  "BCN"  "BCCVV")
  )
)
