<?php

namespace AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

class PlacemarkRepository extends EntityRepository
{
    /**
     * @param $offset
     *
     * @return array
     */
    public function findPlaceOrderedByName($offset)
    {
        return $this->getEntityManager()
            ->createQuery(
                'SELECT p FROM AppBundle:Placemark p  ORDER BY p.name ASC '
            )->setMaxResults(10)->setFirstResult($offset)->getResult();
    }

    /**
     *
     * @return \Doctrine\ORM\Query
     */
    public function queryForPagination()
    {
        return $this->getEntityManager()->createQuery('SELECT p FROM AppBundle:Placemark p');
    }

    /**
     *   Метот инициирует запросы к БД и возвращает
     *   все найденные метки в круге в виде массива
     *
     *   set @lat= 59.9492;   широта
     *   set @lon = 30.3145;  долгота
     *   set @dist = 50;      радиус поиска / км
     *
     * @param $lat
     * @param $lon
     * @param $radius
     * @return array
     * @throws \Doctrine\DBAL\DBALException
     */
    public function findPlacemarks($lat, $lon, $radius)
    {
        $conn = $this->getEntityManager()->getConnection();

        $conn->query("  SET NAMES 'utf8';
                        set @lat= $lat;
                        set @lon = $lon;
                        set @dist = $radius;
                        set @rlon1 = @lon-@dist/abs(cos(radians(@lat))*111.2 );
                        set @rlon2 = @lon+@dist/abs(cos(radians(@lat))*111.2 );
                        set @rlat1 = @lat-(@dist/111.2 );
                        set @rlat2 = @lat+(@dist/111.2 );");

        return $conn->fetchAll(" SELECT id,  name, lat, lon, harvesine(lat, lon, @lat, @lon ) AS dist  FROM placemarkers
                                 WHERE st_within(point(lon, lat), envelope(linestring(point(@rlon1, @rlat1), point(@rlon2, @rlat2))))
                                 HAVING dist<$radius
                                 ORDER BY dist DESC;");
    }
}